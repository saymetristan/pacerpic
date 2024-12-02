import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const dorsal = searchParams.get('dorsal');

  if (!eventId || !dorsal) {
    return new Response('Faltan parámetros', { status: 400 });
  }

  const cleanDorsal = parseInt(dorsal).toString();

  const { data, error } = await supabase
    .from('images')
    .select(`
      id,
      original_url,
      image_dorsals!inner(dorsal_number)
    `)
    .eq('event_id', eventId)
    .eq('image_dorsals.dorsal_number', cleanDorsal)
    .gt('image_dorsals.confidence', 0.7);

  if (error) {
    console.error('Error en la búsqueda:', error);
    return new Response('Error en la búsqueda', { status: 500 });
  }

  const data_with_urls = data?.map(image => ({
    ...image,
    original_url: `${STORAGE_URL}/originals/${image.original_url}`
  }));

  return new Response(JSON.stringify(data_with_urls), {
    headers: { 'Content-Type': 'application/json' }
  });
} 