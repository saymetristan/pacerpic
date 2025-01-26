import { createClient } from '@supabase/supabase-js';
import { processImage } from './image-processing';

export async function processTaggedImages(
  tag: string,
  eventId: string,
  photographerId: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Listar imágenes en el tag
    const { data: files, error } = await supabase.storage
      .from('juntos')
      .list(tag);

    if (error) throw error;

    // Procesar cada imagen
    for (const file of files) {
      // Descargar imagen
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('juntos')
        .download(`${tag}/${file.name}`);

      if (downloadError) {
        console.error(`Error descargando ${file.name}:`, downloadError);
        continue;
      }

      // Procesar imagen
      await processImage(
        Buffer.from(await fileData.arrayBuffer()),
        file.name,
        eventId,
        photographerId,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        tag
      );

      // Opcional: Eliminar imagen procesada de juntos
      await supabase.storage
        .from('juntos')
        .remove([`${tag}/${file.name}`]);
    }

    return { processed: files.length };
  } catch (error) {
    console.error('Error en procesamiento batch:', error);
    throw error;
  }
} 