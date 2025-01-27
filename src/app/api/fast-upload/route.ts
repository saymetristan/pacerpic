import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const preferredRegion = 'sfo1'; // Región más cercana a México

interface UploadedFile {
  path: string;
  name: string;
}

export async function POST(req: Request) {
  try {
    const { files, eventId, photographerId, tag } = await req.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Procesar archivos ya subidos en temp/
    const batchSize = 10;
    const allProcessed = [];

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const processedBatch = await Promise.all(
        batch.map(async (file: UploadedFile) => {
          try {
            // Registrar en base de datos
            const { data: image, error: dbError } = await supabase
              .from('images')
              .insert({
                event_id: eventId,
                photographer_id: photographerId,
                original_url: file.path,
                status: 'uploaded',
                tag
              })
              .select()
              .single();

            if (dbError) throw dbError;

            // Encolar para procesamiento
            await supabase.functions.invoke('process-ai', {
              body: { 
                imageId: image.id,
                path: file.path
              }
            });

            return image;
          } catch (error) {
            console.error(`Error procesando ${file.path}:`, error);
            return null;
          }
        })
      );

      allProcessed.push(...processedBatch.filter(Boolean));
    }

    return NextResponse.json({ 
      status: 'processing',
      count: allProcessed.length,
      images: allProcessed
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imágenes' },
      { status: 500 }
    );
  }
} 