import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;

  if (!eventId) {
    return new Response('ID del evento requerido', { status: 400 });
  }

  try {
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!eventExists || eventError) {
      return new Response('Evento no encontrado', { status: 404 });
    }

    const { count } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    console.log('Total de imágenes en la base de datos:', count);

    const { data, error } = await supabase
      .from('images')
      .select(`
        id,
        event_id,
        original_url,
        created_at,
        tag,
        image_dorsals(dorsal_number, confidence)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      return new Response('Error al obtener imágenes', { status: 500 });
    }

    const images_with_urls = data?.map(image => ({
      ...image,
      original_url: `${STORAGE_URL}/originals/${image.original_url}`,
      dorsals: image.image_dorsals?.map(d => ({
        number: d.dorsal_number,
        confidence: d.confidence
      })) || []
    }));

    return new Response(JSON.stringify(images_with_urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    return new Response('Error interno del servidor', { status: 500 });
  }
} 