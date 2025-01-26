import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 20;

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  const tag = searchParams.get('tag');
  
  try {
    let query = supabase
      .from('images')
      .select('compressed_url')
      .eq('event_id', params.eventId);

    if (tag) {
      query = query.eq('tag', tag);
    }

    query = query.range(offset, offset + CHUNK_SIZE - 1);
    const { data: images, count } = await query;

    if (!images?.length) {
      return new Response(JSON.stringify({ done: true, count }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const zip = new JSZip();
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

    const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': zipBlob.size.toString(),
        'X-Total-Count': count?.toString() || '0',
        'X-Current-Offset': offset.toString()
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error procesando imágenes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 