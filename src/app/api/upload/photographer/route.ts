import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const tag = formData.get('tag') as string;

  try {
    const { data, error } = await supabase.storage
      .from('juntos')
      .upload(`${tag}/${file.name}`, file, {
        upsert: true
      });

    if (error) throw error;
    return Response.json(data);
  } catch (error: unknown) {
    const err = error as { message: string };
    return Response.json({ error: err.message || 'Error desconocido' }, { status: 400 });
  }
} 