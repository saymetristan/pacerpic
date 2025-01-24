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

function initializeWorker() {
  if (isWorkerInitialized) return;
  
  console.log('🚀 Worker iniciado');

  imageQueue.on('ready', () => {
    console.log('📦 Cola lista para procesar');
  });

  imageQueue.on('error', (error) => {
    console.error('❌ Error en la cola:', error);
  });

  imageQueue.on('active', (job) => {
    console.log(`⚡ Job ${job.id} iniciado`);
  });

  imageQueue.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completado`);
  });

  imageQueue.on('failed', (job, error) => {
    console.error(`❌ Job ${job?.id} falló:`, error);
  });

  imageQueue.process(async (job) => {
    const startTime = Date.now();
    console.log(`⚙️ Iniciando job ${job.id} - ${new Date().toISOString()}`);
    
    const { filePath, fileName, eventId, photographerId, accessToken } = job.data;
    
    try {
      console.log('📥 Descargando archivo temporal:', filePath);
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('originals')
        .download(filePath);

      if (downloadError) {
        console.error('❌ Error descargando archivo:', downloadError);
        throw downloadError;
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      
      console.log('🔄 Procesando imagen');
      const result = await processImage(
        buffer,
        fileName,
        eventId,
        photographerId,
        accessToken
      );

      console.log('✅ Procesamiento completado');
      return result;
    } catch (err) {
      console.error('❌ Error en procesamiento:', err);
      throw err;
    }
  });

  isWorkerInitialized = true;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'iad1';

export async function GET() {
  initializeWorker();
  return new Response('Worker running', { status: 200 });
} 