import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const preferredRegion = 'sfo3'; // Región más cercana a México

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const eventId = formData.get('eventId') as string;
  const photographerId = formData.get('photographerId') as string;
  const tag = formData.get('tag') as string;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Subir a bucket temporal
  const uploads = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const path = `temp/${eventId}/${Date.now()}-${file.name}`;
      
      await supabase.storage
        .from('temp')
        .upload(path, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      return { path, name: file.name };
    })
  );

  // Invocar función edge de Supabase para procesamiento paralelo
  await supabase.functions.invoke('process-images', {
    body: {
      images: uploads,
      eventId,
      photographerId,
      tag
    }
  });

  return NextResponse.json({ status: 'processing', count: files.length });
} 