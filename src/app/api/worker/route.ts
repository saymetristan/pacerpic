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

  imageQueue.process(async (job) => {
    console.log(`⚙️ Procesando job ${job.id}`);
    const { filePath, fileName, eventId, photographerId, accessToken } = job.data;
    
    try {
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('originals')
        .download(filePath);

      if (downloadError) throw downloadError;

      const buffer = Buffer.from(await fileData.arrayBuffer());
      const result = await processImage(buffer, fileName, eventId, photographerId, accessToken);
      
      // Limpiar archivo temporal después del procesamiento
      await supabaseAdmin.storage
        .from('originals')
        .remove([filePath]);
      
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