import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public';

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
    
    for (let i = 0; i < images.length; i++) {
      const imageUrl = `${STORAGE_URL}/compressed/${images[i].compressed_url}`;
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.error(`Error descargando imagen ${i + 1}:`, response.statusText);
        continue;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      zip.file(`imagen-${i + 1}.jpg`, arrayBuffer);
    }

    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'STORE'  // Sin compresión para evitar corrupción
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