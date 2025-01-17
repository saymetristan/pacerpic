import { supabase } from '@/lib/supabase';
import AdmZip from 'adm-zip';

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

    const zip = new AdmZip();

    for (let offset = 0; offset < count; offset += CHUNK_SIZE) {
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
          zip.addFile(`imagen-${offset + 1}.jpg`, Buffer.from(buffer));
        }
      }
    }

    const zipBuffer = zip.toBuffer();

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 