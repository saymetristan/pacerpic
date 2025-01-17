import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 100; // Procesar 100 imágenes a la vez

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const zip = new JSZip();
    
    // Obtener y procesar imágenes
    let offset = 0;
    while (true) {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) break;

      for (const image of images) {
        const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
        const response = await fetch(imageUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          zip.file(`imagen-${offset + 1}.jpg`, buffer);
        }
        offset++;
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
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