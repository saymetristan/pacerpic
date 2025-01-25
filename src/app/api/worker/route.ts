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
      const { data: fileData, error: downloadError } = await Promise.race([
        supabaseAdmin.storage
          .from('originals')
          .download(filePath),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject({
            data: null, 
            error: new Error('Timeout descargando archivo')
          }), 30000)
        )
      ]);

      if (downloadError) {
        console.error('❌ Error descargando archivo:', downloadError);
        throw downloadError;
      }

      console.log('✅ Archivo descargado, convirtiendo a buffer...');
      const buffer = Buffer.from(await fileData.arrayBuffer());
      
      await job.progress(25);
      
      console.log('🔄 Iniciando processImage...');
      const result = await Promise.race([
        processImage(buffer, fileName, eventId, photographerId, accessToken),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout procesando imagen')), 240000)
        )
      ]);
      
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
  
  // Obtener estado actual de la cola
  const [waiting, active] = await Promise.all([
    imageQueue.getWaitingCount(),
    imageQueue.getActiveCount()
  ]);

  // Forzar procesamiento de jobs pendientes
  if (waiting > 0) {
    console.log(`🔄 ${waiting} jobs pendientes por procesar`);
  }

  return new Response(
    JSON.stringify({
      status: 'running',
      jobs: {
        waiting,
        active
      }
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
} 