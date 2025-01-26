import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const tag = formData.get('tag') as string;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const compressedBuffer = await sharp(buffer)
      .resize(1300, 1300, { fit: 'inside' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    const { data, error } = await supabase.storage
      .from('juntos')
      .upload(`${tag}/${file.name}`, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;
    return Response.json(data);
  } catch (error: unknown) {
    const err = error as { message: string };
    return Response.json({ error: err.message || 'Error desconocido' }, { status: 400 });
  }
} 