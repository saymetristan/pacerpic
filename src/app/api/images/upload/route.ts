import { processImage } from '@/lib/image-processing';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagen demasiado grande. Máximo 10MB' },
        { status: 413 }
      );
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    const photographerId = formData.get('photographerId') as string;

    if (!file || !eventId || !isValidUUID(eventId) || !photographerId) {
      return NextResponse.json(
        { error: 'Archivo, eventId (UUID válido) y photographerId son requeridos' },
        { status: 400 }
      );
    }

    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acceso no encontrado' }, { status: 401 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageData = await processImage(buffer, file.name, eventId, photographerId, accessToken);

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
