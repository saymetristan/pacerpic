import { imageQueue } from '@/lib/queue';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    console.log('Session:', {
      user: session?.user?.sub,
      accessToken: session?.accessToken ? 'Present' : 'Missing'
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Configurar sesión de Supabase con service role
    await supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: ''
    });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const photographerId = formData.get('photographerId') as string;

    console.log('Request data:', { eventId, photographerId, fileName: file.name });

    // Verificar si existe el bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const originalsExists = buckets?.some(b => b.name === 'originals');
    
    if (!originalsExists) {
      console.log('Creando bucket originals');
      await supabase.storage.createBucket('originals', {
        public: false,
        fileSizeLimit: 26214400 // 25MB
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `temp/${eventId}/${Date.now()}-${file.name}`;
    
    console.log('Intentando subir a storage temporal:', filePath);
    const { error: uploadError } = await supabase.storage
      .from('originals')
      .upload(filePath, buffer);

    if (uploadError) {
      console.error('Error subiendo a storage:', uploadError);
      throw uploadError;
    }

    console.log('Archivo subido exitosamente, encolando tarea');
    const job = await imageQueue.add({
      filePath,
      fileName: file.name,
      eventId,
      photographerId,
      accessToken: session.accessToken
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    });

    return NextResponse.json({ jobId: job.id });

  } catch (error) {
    console.error('Error detallado:', error);
    return NextResponse.json(
      { error: 'Error procesando imagen', details: error },
      { status: 500 }
    );
  }
}