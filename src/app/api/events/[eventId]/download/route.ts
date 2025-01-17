import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 10;

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', params.eventId);

    if (!count) {
      return new Response('No hay imágenes', { status: 404 });
    }

    const zip = new JSZip();
    let processedCount = 0;

    // Procesar todas las imágenes primero
    for (let offset = 0; offset < count; offset += CHUNK_SIZE) {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) break;

      await Promise.all(
        images.map(async (image) => {
          const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
          const response = await fetch(imageUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            zip.file(`imagen-${processedCount + 1}.jpg`, buffer);
            processedCount++;
          }
        })
      );
    }

    // Generar el ZIP completo
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE',
      streamFiles: true
    });

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
        'Content-Length': blob.size.toString()
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 