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
    
    const { data, error } = await supabase
      .from('images')
      .select(`
        id,
        original_url,
        created_at,
        image_dorsals(dorsal_number, confidence)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    console.log('Respuesta de Supabase:', {
      dataCount: data?.length || 0,
      error
    });

    if (error) {
      console.error('Error de Supabase:', error);
      return new Response('Error al obtener imágenes', { status: 500 });
    }

    const images_with_urls = data?.map(image => ({
      id: image.id,
      original_url: `${STORAGE_URL}/originals/${image.original_url}`,
      created_at: image.created_at,
      dorsals: image.image_dorsals.map(d => ({
        number: d.dorsal_number,
        confidence: d.confidence
      }))
    }));

    console.log('Respuesta final:', {
      imagesCount: images_with_urls?.length || 0,
      firstImageUrl: images_with_urls?.[0]?.original_url
    });

    return new Response(JSON.stringify(images_with_urls), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Error inesperado completo:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response('Error interno del servidor', { status: 500 });
  }
} 