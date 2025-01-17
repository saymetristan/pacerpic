import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 10;

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    // Obtener total de imágenes para el progreso
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', params.eventId);

    if (!count) {
      return new Response('No hay imágenes para descargar', { status: 404 });
    }

    const zip = new JSZip();
    let processedCount = 0;

    // Procesar en chunks pequeños
    for (let offset = 0; offset < count; offset += CHUNK_SIZE) {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) break;

      // Descargar imágenes en paralelo dentro del chunk
      await Promise.all(
        images.map(async (image, index) => {
          try {
            const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
            const response = await fetch(imageUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              zip.file(`imagen-${offset + index + 1}.jpg`, buffer);
              processedCount++;
            }
          } catch (error) {
            console.error(`Error procesando imagen ${offset + index + 1}:`, error);
          }
        })
      );
    }

    // Generar ZIP con compresión STORE (más rápido)
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 