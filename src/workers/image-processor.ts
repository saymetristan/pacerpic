import { imageQueue } from '@/lib/queue';
import { processImage } from '@/lib/image-processing';
import { supabase } from '@/lib/supabase';

imageQueue.process(async (job) => {
  const { filePath, fileName, eventId, photographerId, accessToken } = job.data;
  
  console.log('Iniciando procesamiento:', {
    filePath,
    eventId,
    photographerId
  });

  try {
    console.log('Configurando sesión de Supabase');
    await supabase.auth.setSession({
      access_token: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      refresh_token: ''
    });

    console.log('Descargando archivo temporal');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('originals')
      .download(filePath);

    if (downloadError) {
      console.error('Error descargando archivo:', downloadError);
      throw downloadError;
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    
    console.log('Procesando imagen');
    const result = await processImage(
      buffer,
      fileName,
      eventId,
      photographerId,
      accessToken
    );

    console.log('Limpiando archivo temporal');
    await supabase.storage
      .from('originals')
      .remove([filePath]);

    console.log('Procesamiento completado');
    return result;
  } catch (err) {
    console.error('Error detallado en procesamiento:', err);
    throw err;
  }
});