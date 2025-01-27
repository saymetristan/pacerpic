import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const runtime = 'edge';
export const preferredRegion = 'sfo1'; // Región más cercana a México

export async function POST(req: Request) {
  console.log('Iniciando fast-upload');
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const eventId = formData.get('eventId') as string;
  const photographerId = formData.get('photographerId') as string;
  const tag = formData.get('tag') as string;

  console.log('Datos recibidos:', { 
    filesCount: files.length, 
    eventId, 
    photographerId, 
    tag 
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Subir y comprimir en paralelo
    const uploads = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const compressedBuffer = await sharp(Buffer.from(buffer))
          .resize(1300, 1300, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Subir original y comprimida
        const [originalUpload, compressedUpload] = await Promise.all([
          supabase.storage
            .from('originals')
            .upload(`originals/${eventId}/${file.name}`, buffer, {
              contentType: 'image/jpeg',
              upsert: true
            }),
          supabase.storage
            .from('compressed')
            .upload(`compressed/${eventId}/${file.name}`, compressedBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            })
        ]);

        if (originalUpload.error) throw originalUpload.error;
        if (compressedUpload.error) throw compressedUpload.error;

        // Registrar en BD
        const { data: image } = await supabase
          .from('images')
          .insert({
            event_id: eventId,
            photographer_id: photographerId,
            original_url: `originals/${eventId}/${file.name}`,
            compressed_url: `compressed/${eventId}/${file.name}`,
            status: 'pending_ai',
            tag
          })
          .select()
          .single();

        return image;
      })
    );

    // 2. Encolar procesamiento AI
    await supabase.functions.invoke('process-ai', {
      body: { 
        images: uploads.map(img => ({
          id: img.id,
          compressed_url: img.compressed_url
        }))
      }
    });

    return NextResponse.json({ 
      status: 'processing', 
      count: files.length,
      images: uploads 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imágenes' }, 
      { status: 500 }
    );
  }
} 