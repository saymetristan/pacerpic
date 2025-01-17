import { supabase } from '@/lib/supabase';
import archiver from 'archiver';
import { Readable } from 'stream';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';
const CHUNK_SIZE = 100; // Procesar 100 imágenes a la vez

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  const archive = archiver('zip', {
    store: true // Sin compresión
  });

  // Convertir el stream de archiver a un formato que el navegador pueda leer
  archive.on('data', async (chunk: Buffer) => {
    await writer.write(chunk);
  });

  archive.on('end', async () => {
    await writer.close();
  });

  // Iniciar el streaming de la respuesta
  const response = new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`
    }
  });

  // Procesar imágenes en chunks
  let offset = 0;
  while (true) {
    const { data: images } = await supabase
      .from('images')
      .select('compressed_url')
      .eq('event_id', params.eventId)
      .range(offset, offset + CHUNK_SIZE - 1);

    if (!images?.length) break;

    for (let i = 0; i < images.length; i++) {
      const imageUrl = `${STORAGE_URL}/compressed/${images[i].compressed_url}`;
      const response = await fetch(imageUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        archive.append(Buffer.from(buffer), { name: `imagen-${offset + i + 1}.jpg` });
      }
    }

    offset += images.length;
  }

  archive.finalize();
  return response;
} 