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

    // Descargar y añadir cada imagen al ZIP
    const imagePromises = images.map(async (image, index) => {
      const response = await fetch(image.compressed_url);
      const blob = await response.blob();
      zip.file(`imagen-${index + 1}.jpg`, blob);
    });

    await Promise.all(imagePromises);
    const zipBlob = await zip.generateAsync({ type: 'blob' });

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