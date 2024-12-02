import { processImage } from '@/lib/image-processing';
import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file || !eventId || !isValidUUID(eventId)) {
      return NextResponse.json(
        { error: 'Archivo y eventId (UUID válido) son requeridos' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageData = await processImage(buffer, file.name, eventId, session.user.sub, session.accessToken);

    return NextResponse.json(imageData);
  } catch (error) {
    console.error('Error procesando imagen:', error);
    return NextResponse.json(
      { error: 'Error procesando imagen' },
      { status: 500 }
    );
  }
}

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
} 