import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';
import { Readable } from 'stream';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 10;

export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Iniciar respuesta inmediatamente
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
      'Transfer-Encoding': 'chunked'
    }
  });

  (async () => {
    try {
      const { count } = await supabase
        .from('images')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', params.eventId);

      if (!count) {
        await writer.close();
        return;
      }

      const zip = new JSZip();

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
            zip.file(`imagen-${offset + 1}.jpg`, buffer);
          }
        }

        // Generar y enviar chunk del ZIP
        const chunk = await zip.generateAsync({ type: 'uint8array', compression: 'STORE' });
        await writer.write(chunk);
      }

      await writer.close();
    } catch (error) {
      console.error('Error:', error);
      await writer.abort(error as Error);
    }
  })();

  return response;
} 