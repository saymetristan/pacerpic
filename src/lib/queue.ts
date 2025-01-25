import Bull from 'bull';
import { Redis } from '@upstash/redis';

// Extraer el host real de la URL
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!;
const host = REDIS_URL.replace('https://', '').split('/')[0];

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const imageQueue = new Bull('image-processing', {
  redis: {
    host,
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
    tls: { rejectUnauthorized: false }
  },
  prefix: 'bull',
  settings: {
    lockDuration: 300000,        // 5 minutos
    stalledInterval: 30000,      // 30 segundos
    maxStalledCount: 1,          // Solo 1 intento si se estanca
    retryProcessDelay: 5000      // 5 segundos entre reintentos
  },
  limiter: {
    max: 1,
    duration: 600000            // 10 minutos
  }
});

// Eventos para debugging con más detalles
imageQueue.on('active', (job) => {
  console.log(`⚙️ Job ${job.id} iniciando procesamiento`, job.data);
});

imageQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progreso:`, progress);
});

imageQueue.on('completed', async (job) => {
  console.log(`✅ Job ${job.id} completado y limpiado`);
  await job.moveToCompleted(job.returnvalue);
  await job.remove();
});

imageQueue.on('failed', async (job, err) => {
  console.error(`❌ Job ${job.id} falló:`, err);
  await job.moveToFailed({message: err instanceof Error ? err.message : String(err)});
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la cola:', error);
});