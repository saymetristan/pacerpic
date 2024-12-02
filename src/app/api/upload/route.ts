import { processImage } from '@/lib/image-processing';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const eventId = formData.get('eventId') as string;
  const photographerId = formData.get('photographerId') as string;
  const accessToken = formData.get('accessToken') as string;
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const result = await processImage(
    buffer,
    file.name,
    eventId,
    photographerId,
    accessToken
  );

  return Response.json(result);
} 