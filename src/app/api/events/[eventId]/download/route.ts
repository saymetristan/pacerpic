import { supabase } from '@/lib/supabase';

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

    // Obtener todas las imágenes primero
    const allImages = [];
    for (let offset = 0; offset < count; offset += CHUNK_SIZE) {
      const { data: images } = await supabase
        .from('images')
        .select('compressed_url')
        .eq('event_id', params.eventId)
        .range(offset, offset + CHUNK_SIZE - 1);

      if (!images?.length) break;
      allImages.push(...images);
    }

    // Descargar todas las imágenes
    const imageBuffers = await Promise.all(
      allImages.map(async (image, index) => {
        const imageUrl = `${STORAGE_URL}/compressed/${image.compressed_url}`;
        const response = await fetch(imageUrl);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return {
          buffer: Buffer.from(buffer),
          name: `imagen-${index + 1}.jpg`
        };
      })
    );

    // Crear un único buffer con todas las imágenes
    const totalSize = imageBuffers.reduce((size, img) => size + (img?.buffer.length || 0), 0);
    const finalBuffer = Buffer.alloc(totalSize);
    let offset = 0;

    imageBuffers.forEach(img => {
      if (img?.buffer) {
        img.buffer.copy(finalBuffer, offset);
        offset += img.buffer.length;
      }
    });

    return new Response(finalBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`,
        'Content-Length': finalBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Error interno', { status: 500 });
  }
} 