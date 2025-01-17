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

    archive.on('data', async (chunk: Buffer) => {
      await writer.write(chunk);
    });

    archive.on('warning', (err) => {
      console.warn('Advertencia de archiver:', err);
    });

    archive.on('error', (err) => {
      console.error('Error de archiver:', err);
      writer.abort(err);
    });

    archive.on('end', () => {
      writer.close();
    });

    // Procesar imágenes
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
          archive.append(Buffer.from(buffer), { name: `imagen-${offset + 1}.jpg` });
        }
        offset++;
      }
    }

    // Finalizar el archivo ZIP
    archive.finalize();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
        'Content-Length': String((count || 0) * 1024 * 1024)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 