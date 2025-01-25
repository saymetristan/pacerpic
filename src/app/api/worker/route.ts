import { createClient } from '@supabase/supabase-js';
import { imageQueue } from '@/lib/queue';
import { processImage } from '@/lib/image-processing';

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
      
      await job.progress(25);
      
      console.log('🔄 Iniciando processImage...');
      const result = await processImage(
        filePath,
        fileName,
        eventId,
        photographerId,
        accessToken,
        job
      );
      
      await job.progress(90);
      
      console.log('🧹 Limpiando archivo temporal...');
      await supabaseAdmin.storage
        .from('originals')
        .remove([filePath]);
      
      await job.progress(100);
      console.log(`✅ Job ${job.id} completado`);
      return result;
    } catch (err) {
      console.error(`❌ Error en job ${job.id}:`, err);
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
  
  // Forzar procesamiento de jobs pendientes
  const jobs = await imageQueue.getJobs(['waiting', 'failed', 'delayed']);
  
  if (jobs.length > 0) {
    console.log(`🔄 Procesando ${jobs.length} jobs pendientes...`);
    
    const promises = jobs.map(job => 
      new Promise(async (resolve) => {
        try {
          // Procesar directamente sin crear nuevo job
          const result = await processImage(
            job.data.filePath,
            job.data.fileName,
            job.data.eventId,
            job.data.photographerId,
            job.data.accessToken,
            job
          );
          await job.moveToCompleted(result);
          resolve(true);
        } catch (err) {
          console.error(`Error procesando job ${job.id}:`, err);
          await job.moveToFailed({ message: err instanceof Error ? err.message : String(err) });
          resolve(false);
        }
      })
    );

    await Promise.allSettled(promises);
  }

  const [waiting, active] = await Promise.all([
    imageQueue.getWaitingCount(),
    imageQueue.getActiveCount()
  ]);

  return new Response(
    JSON.stringify({ 
      status: 'completed',
      processed: jobs.length,
      jobs: { waiting, active }
    }),
    { status: 200 }
  );
} 