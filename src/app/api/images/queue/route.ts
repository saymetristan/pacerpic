import { imageQueue } from '@/lib/queue';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const photographerId = formData.get('photographerId') as string;

    // Subir primero a storage temporal
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `temp/${eventId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('originals')
      .upload(filePath, buffer);

    if (uploadError) throw uploadError;

    // Encolar tarea
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
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imagen' },
      { status: 500 }
    );
  }
}