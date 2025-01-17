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

    for (let offset = 0; offset < count; offset += CHUNK_SIZE) {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) break;

      await Promise.all(
        images.map(async (image, index) => {
          const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
          const response = await fetch(imageUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            zip.file(`imagen-${offset + index + 1}.jpg`, buffer);
          }
        })
      );
    }

    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'STORE',
      streamFiles: true,
      mimeType: 'application/zip'
    });

    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
      'Content-Length': zipBlob.size.toString(),
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    return new Response(zipBlob, { headers });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 