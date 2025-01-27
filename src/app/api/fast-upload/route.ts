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
    const batchSize = 20;
    const allUploads = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`Procesando lote ${i/batchSize + 1} de ${Math.ceil(files.length/batchSize)}`);

      const batchUploads = await Promise.all(
        batch.map(async (file) => {
          try {
            const buffer = await file.arrayBuffer();
            const compressedBuffer = await sharp(Buffer.from(buffer))
              .resize(1300, 1300, { fit: 'inside' })
              .jpeg({ quality: 80 })
              .toBuffer();

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

            const { data: image, error: insertError } = await supabase
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

            if (insertError || !image) {
              throw new Error(`Error insertando imagen: ${insertError?.message || 'No data returned'}`);
            }

            console.log('Imagen insertada:', image.id);
            return image;
          } catch (error) {
            console.error(`Error procesando archivo ${file.name}:`, error);
            return null;
          }
        })
      );
      
      const validUploads = batchUploads.filter(upload => upload !== null);
      if (validUploads.length > 0) {
        allUploads.push(...validUploads);
        
        const aiBatchSize = 10;
        for (let j = 0; j < validUploads.length; j += aiBatchSize) {
          const aiBatch = validUploads.slice(j, j + aiBatchSize);
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
    }

    return NextResponse.json({ 
      status: 'processing', 
      count: allUploads.length,
      total_batches: Math.ceil(files.length/batchSize),
      images: allUploads.map(img => ({
        id: img.id,
        status: img.status
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