import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;

  if (!eventId) {
    return new Response('ID del evento requerido', { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('images')
      .select(`
        id,
        original_url,
        created_at,
        image_dorsals!inner(dorsal_number, confidence)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener imágenes:', error);
      return new Response('Error al obtener imágenes', { status: 500 });
    }

    const images_with_urls = data?.map((image) => ({
      id: image.id,
      original_url: image.original_url,
      created_at: image.created_at,
      dorsals: image.image_dorsals.map((d) => ({
        number: d.dorsal_number,
        confidence: d.confidence
      }))
    }));

    return new Response(JSON.stringify(images_with_urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
} 