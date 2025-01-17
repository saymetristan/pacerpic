import { processImage } from '@/lib/image-processing';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    console.log('Session:', session);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const photographerId = session.user.sub;

    console.log('Upload params:', { 
      fileExists: !!file, 
      eventId, 
      photographerId,
      fileName: file?.name 
    });

    if (!file || !eventId || !photographerId) {
      return NextResponse.json(
        { error: 'Archivo, eventId y photographerId son requeridos' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageData = await processImage(
      buffer, 
      file.name, 
      eventId, 
      photographerId,
      session.accessToken || ''
    );

    return NextResponse.json(imageData);
  } catch (error: any) {
    console.error('Error detallado:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando imagen' },
      { status: 500 }
    );
  }
}

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
