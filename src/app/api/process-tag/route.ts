import { processTaggedImages } from '@/lib/batch-processing';

export async function POST(req: Request) {
  try {
    const { tag, eventId, photographerId } = await req.json();
    
    const result = await processTaggedImages(
      tag,
      eventId,
      photographerId
    );

    return Response.json(result);
  } catch (error: unknown) {
    const err = error as { message: string };
    return Response.json(
      { error: err.message || 'Error procesando imágenes' },
      { status: 500 }
    );
  }
} 