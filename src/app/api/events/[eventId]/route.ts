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
      .from('events')
      .select('id, name, date')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error al obtener evento:', error);
      return new Response('Error al obtener evento', { status: 500 });
    }

    if (!data) {
      return new Response('Evento no encontrado', { status: 404 });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
} 