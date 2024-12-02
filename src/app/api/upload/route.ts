import { processImage } from '@/lib/image-processing';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const eventId = formData.get('eventId') as string;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const result = await processImage(
    buffer,
    file.name,
    eventId,
    // Otros params necesarios...
  );

  return Response.json(result);
} 