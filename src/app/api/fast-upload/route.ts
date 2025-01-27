import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // Subir a bucket temporal
    const uploads = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const path = `temp/${eventId}/${Date.now()}-${file.name}`;
        
        console.log(`Subiendo archivo: ${path}`);
        const { data, error } = await supabase.storage
          .from('temp')
          .upload(path, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (error) {
          console.error(`Error subiendo ${path}:`, error);
          throw error;
        }

        console.log(`Archivo subido exitosamente: ${path}`);
        return { path, name: file.name };
      })
    );

    console.log('Todas las imágenes subidas, invocando función edge');
    
    const { data, error } = await supabase.functions.invoke('process-images', {
      body: {
        images: uploads,
        eventId,
        photographerId,
        tag
      }
    });

    if (error) {
      console.error('Error en función edge:', error);
      throw error;
    }

    console.log('Respuesta de función edge:', data);
    return NextResponse.json({ status: 'processing', count: files.length });
    
  } catch (error) {
    console.error('Error en fast-upload:', error);
    return NextResponse.json(
      { error: 'Error procesando imágenes', details: error }, 
      { status: 500 }
    );
  }
} 