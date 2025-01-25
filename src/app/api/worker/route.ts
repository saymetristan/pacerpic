import { createClient } from '@supabase/supabase-js';
import { imageQueue } from '@/lib/queue';
import { processImage } from '@/lib/image-processing';
import sharp from 'sharp';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

let isWorkerInitialized = false;

async function initializeWorker() {
  if (isWorkerInitialized) return;
  
  console.log('🚀 Worker iniciado');

  imageQueue.process(1, async (job) => {
    console.log(`⚙️ Procesando job ${job.id}`);
    const { filePath, fileName, eventId, photographerId, accessToken } = job.data;
    
    try {
      console.log('📥 Descargando archivo:', filePath);
      const downloadResult = await supabaseAdmin.storage
        .from('originals')
        .download(filePath);

      if (downloadResult.error) {
        console.error('❌ Error descargando archivo:', downloadResult.error);
        throw downloadResult.error;
      }

      if (!downloadResult.data) {
        throw new Error('No se pudo descargar el archivo');
      }

      console.log('✅ Archivo descargado, convirtiendo a buffer...');
      const buffer = Buffer.from(await downloadResult.data.arrayBuffer());
      console.log('Buffer size:', buffer.length, 'bytes');
      
      // Validar que sea una imagen usando sharp
      try {
        const metadata = await sharp(buffer).metadata();
        console.log('Metadata:', metadata);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Formato de imagen no válido: ${message}`);
      }
      
      await job.progress(25);
      
      console.log('🔄 Iniciando processImage...');
      const result = await processImage(
        buffer,
        fileName,
        eventId,
        photographerId,
        accessToken,
        job
      );
      
      await job.progress(100);
      console.log('✅ Proceso completado exitosamente:', {
        jobId: job.id,
        fileName,
        eventId
      });
      await job.moveToCompleted(JSON.stringify(result));
      return result;
    } catch (err) {
      console.error('❌ Error en el proceso:', err);
      await job.moveToFailed({message: err instanceof Error ? err.message : String(err)});
      throw err;
    }
  });

  isWorkerInitialized = true;
  console.log('✅ Worker listo para procesar jobs');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET() {
  await initializeWorker();
  
  const jobs = await imageQueue.getJobs(['waiting', 'failed', 'delayed']);
  
  if (jobs.length > 0) {
    console.log(`🔄 Procesando ${jobs.length} jobs pendientes...`);
    
    const promises = jobs.map(job => 
      new Promise(async (resolve, reject) => {
        try {
          const downloadResult = await supabaseAdmin.storage
            .from('originals')
            .download(job.data.filePath);

          if (!downloadResult.data) {
            throw new Error('No se pudo descargar el archivo');
          }

          const buffer = Buffer.from(await downloadResult.data.arrayBuffer());
          const result = await processImage(
            buffer,
            job.data.fileName,
            job.data.eventId,
            job.data.photographerId,
            job.data.accessToken,
            job
          );
          
          console.log(`✅ Job ${job.id} procesado correctamente:`, result);
          resolve(result);
        } catch (err) {
          console.error(`❌ Error procesando job ${job.id}:`, err);
          reject(err);
        }
      })
    );

    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === 'rejected').length;
    const succeeded = results.filter(r => r.status === 'fulfilled').length;

    console.log('📊 Resumen del procesamiento:', {
      total: jobs.length,
      succeeded,
      failed
    });

    return new Response(
      JSON.stringify({ 
        status: 'completed',
        processed: jobs.length,
        succeeded,
        failed,
        jobs: await imageQueue.getJobCounts()
      })
    );
  }

  return new Response(
    JSON.stringify({
      status: 'idle',
      jobs: await imageQueue.getJobCounts()
    })
  );
} 