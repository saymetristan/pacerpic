import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY no está definida');
}

export const runtime = 'nodejs';
export const preferredRegion = 'sfo1'; // Región más cercana a México

interface UploadedFile {
  path: string;
  name: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const eventId = formData.get('eventId') as string;
    const photographerId = formData.get('photographerId') as string;
    const tag = formData.get('tag') as string;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    const allUploads = [];

    for (const file of files) {
      try {
        const tempPath = `temp/${eventId}/${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from('originals')
          .upload(tempPath, buffer, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: image, error: dbError } = await supabase
          .from('images')
          .insert({
            event_id: eventId,
            photographer_id: photographerId,
            original_url: tempPath,
            status: 'uploaded',
            tag
          })
          .select()
          .single();

        if (dbError) throw dbError;
        allUploads.push(image);

      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
      }
    }

    return NextResponse.json({ 
      status: 'processing',
      count: allUploads.length,
      images: allUploads
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imágenes' },
      { status: 500 }
    );
  }
} 