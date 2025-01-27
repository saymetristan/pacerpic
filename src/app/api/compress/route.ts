import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Cambiar a runtime nodejs
export const runtime = 'nodejs';
export const preferredRegion = 'sfo1';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;
    
    const buffer = await file.arrayBuffer();
    const compressedBuffer = await sharp(Buffer.from(buffer))
      .resize(1300, 1300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const compressedPath = `compressed/${eventId}/${file.name}`;
    
    await supabase.storage
      .from('compressed')
      .upload(compressedPath, compressedBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    return NextResponse.json({ 
      success: true, 
      path: compressedPath 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando imagen' },
      { status: 500 }
    );
  }
} 