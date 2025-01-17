import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 50;

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  const zip = new JSZip();
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  try {
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', params.eventId);

    if (!count) return new Response('No hay imágenes', { status: 404 });

    const { data: images } = await supabase
      .from('images')
      .select('compressed_url')
      .eq('event_id', params.eventId)
      .range(offset, offset + CHUNK_SIZE - 1);

    if (!images?.length) {
      return new Response(JSON.stringify({ done: true, count }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    }

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

    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'
    });

    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': zipBlob.size.toString(),
        'X-Total-Count': count.toString(),
        'X-Current-Offset': offset.toString()
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 