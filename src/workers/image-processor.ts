import { imageQueue } from '@/lib/queue';
import { processImage } from '@/lib/image-processing';
import { supabase } from '@/lib/supabase';

imageQueue.process(async (job) => {
  const { filePath, fileName, eventId, photographerId, accessToken } = job.data;
  
  try {
    // Obtener archivo temporal
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('originals')
      .download(filePath);

    if (downloadError) throw downloadError;

    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    // Procesar imagen
    const result = await processImage(
      buffer,
      fileName,
      eventId,
      photographerId,
      accessToken
    );

    // Limpiar archivo temporal
    await supabase.storage
      .from('originals')
      .remove([filePath]);

    return result;
  } catch (err) {
    console.error('Error procesando imagen:', err);
    throw err;
  }
});