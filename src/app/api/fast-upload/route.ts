import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const runtime = 'nodejs';
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
    // Aumentar tamaño del lote para subidas
    const batchSize = 20;
    const allUploads = [];
    
    // Dividir en chunks más grandes para subida inicial
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`Procesando lote ${i/batchSize + 1} de ${Math.ceil(files.length/batchSize)}`);

      const batchUploads = await Promise.all(
        batch.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const compressedBuffer = await sharp(Buffer.from(buffer))
            .resize(1300, 1300, { fit: 'inside' })
            .jpeg({ quality: 80 })
            .toBuffer();

          // Subir en paralelo
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

          // Registrar en base de datos
          const { data: image } = await supabase
            .from('images')
            .insert({
              event_id: eventId,
              photographer_id: photographerId,
              original_url: `originals/${eventId}/${file.name}`,
              compressed_url: `compressed/${eventId}/${file.name}`,
              status: 'pending_ai',
              tag,
              batch_number: Math.floor(i/batchSize) // Agregar número de lote
            })
            .select()
            .single();

          return image;
        })
      );
      
      allUploads.push(...batchUploads);
      
      // Encolar procesamiento AI en lotes más pequeños
      const aiBatchSize = 10;
      for (let j = 0; j < batchUploads.length; j += aiBatchSize) {
        const aiBatch = batchUploads.slice(j, j + aiBatchSize);
        await supabase.functions.invoke('process-ai', {
          body: { 
            images: aiBatch.map(img => ({
              id: img.id,
              compressed_url: img.compressed_url
            }))
          }
        });
      }
    }

    return NextResponse.json({ 
      status: 'processing', 
      count: files.length,
      total_batches: Math.ceil(files.length/batchSize),
      images: allUploads.map(img => ({
        id: img.id,
        status: img.status,
        batch_number: img.batch_number
      }))
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imágenes' }, 
      { status: 500 }
    );
  }
} 