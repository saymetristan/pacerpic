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
  console.log('GET /api/events/[eventId]/images - Inicio', { eventId: params.eventId });

  const { eventId } = params;

  if (!eventId) {
    console.log('Error: ID del evento no proporcionado');
    return new Response('ID del evento requerido', { status: 400 });
  }

  try {
    console.log('Consultando Supabase...');
    
    // Verifica el evento
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    console.log('Datos del evento:', eventExists);
    if (eventError) console.error('Error al obtener evento:', eventError);

    if (!eventExists) {
      console.log('Evento no encontrado');
      return new Response('Evento no encontrado', { status: 404 });
    }

    // Verifica las imágenes
    const { count: imagesCount } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    console.log('Total de imágenes para el evento:', imagesCount);

    const { data, error } = await supabase
      .from('images')
      .select(`
        id,
        event_id,
        original_url,
        created_at,
        tags,
        image_dorsals(dorsal_number, confidence)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    console.log('Query de imágenes error:', error);
    console.log('Datos crudos de Supabase:', data);

    if (error) {
      console.error('Error de Supabase:', error);
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

    console.log('Respuesta final detallada:', {
      imagesCount: images_with_urls?.length || 0,
      firstImage: images_with_urls?.[0],
      storageUrl: STORAGE_URL
    });

    return new Response(JSON.stringify(images_with_urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Error inesperado completo:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
} 