import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { data: images } = await supabase
      .from('images')
      .select('compressed_url')
      .eq('event_id', params.eventId);

    if (!images?.length) {
      return new NextResponse('No hay imágenes', { status: 404 });
    }

    const zip = new JSZip();
    
    // Procesar las imágenes secuencialmente para evitar corrupción
    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i].compressed_url);
      const arrayBuffer = await response.arrayBuffer();
      zip.file(`imagen-${i + 1}.jpg`, arrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    return new NextResponse(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${params.eventId}-photos.zip"`
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
} 