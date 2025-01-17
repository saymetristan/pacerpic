import { supabase } from '@/lib/supabase';
import archiver from 'archiver';
import { Readable } from 'stream';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 100; // Procesar 100 imágenes a la vez

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', params.eventId);

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const archive = archiver('zip', { store: true });

    // Iniciar la respuesta inmediatamente
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
        'Transfer-Encoding': 'chunked' // Importante: permite streaming sin Content-Length
      }
    });

    archive.on('data', async (chunk: Buffer) => {
      await writer.write(chunk);
    });

    archive.on('warning', (err) => console.warn('Advertencia:', err));
    archive.on('error', (err) => writer.abort(err));
    archive.on('end', () => writer.close());

    // Procesar y enviar en paralelo
    let offset = 0;
    const processNextChunk = async () => {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) return;

      await Promise.all(images.map(async (image, i) => {
        const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
        const response = await fetch(imageUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          archive.append(Buffer.from(buffer), { name: `imagen-${offset + i + 1}.jpg` });
        }
      }));

      offset += images.length;
      if (images.length === CHUNK_SIZE) {
        await processNextChunk();
      }
    };

    await processNextChunk();
    archive.finalize();

    return response;
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 