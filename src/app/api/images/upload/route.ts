import { processImage } from '@/lib/image-processing';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

interface ProcessImageError {
  message: string;
  code?: string;
  details?: string;
}

export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const preferredRegion = 'iad1';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagen demasiado grande. Máximo 25MB' },
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
    const accessToken = formData.get('accessToken') as string;
    const tag = formData.get('tag') as string;

    if (!file || !eventId || !photographerId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!buffer.length) {
      return NextResponse.json(
        { error: 'Buffer de imagen inválido' },
        { status: 400 }
      );
    }

    try {
      const result = await processImage(
        buffer,
        file.name,
        eventId,
        photographerId,
        accessToken,
        tag
      );

      return NextResponse.json(result);
    } catch (error: unknown) {
      const processError = error as ProcessImageError;
      console.error('Error detallado:', processError);
      return NextResponse.json(
        { error: processError.message || 'Error procesando imagen' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const processError = error as ProcessImageError;
    console.error('Error procesando imagen:', processError);
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
