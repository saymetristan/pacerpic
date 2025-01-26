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
      .select('original_url', { count: 'exact' })
      .eq('event_id', params.eventId);

    if (tag) {
      query = query.eq('tag', tag);
    }

    const { data: countResult } = await query;
    const count = countResult?.length || 0;

    query = query.range(offset, offset + CHUNK_SIZE - 1);
    const { data: images } = await query;

    if (!images?.length) {
      return new Response(JSON.stringify({ done: true, count }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const zip = new JSZip();
    
    await Promise.all(
      images.map(async (image, index) => {
        const imageUrl = `${STORAGE_URL}/originals/${image.original_url}`;
        const response = await fetch(imageUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          zip.file(`imagen-${offset + index + 1}.jpg`, buffer);
        }
      })
    );

    const zipBuffer = await zip.generateAsync({ 
      type: 'arraybuffer',
      compression: 'STORE',
      streamFiles: true
    });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': zipBuffer.byteLength.toString(),
        'X-Total-Count': count.toString(),
        'X-Current-Offset': offset.toString()
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error procesando imágenes' }), {
      status: 500
    });
  }
} 