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
    lockDuration: 600000,        // 10 minutos
    stalledInterval: 60000,      // 1 minuto
    maxStalledCount: 2,          // 2 intentos si se estanca
    retryProcessDelay: 10000     // 10 segundos entre reintentos
  },
  limiter: {
    max: 1,
    duration: 900000            // 15 minutos
  }
});

// Eventos para debugging con más detalles
imageQueue.on('active', (job) => {
  console.log(`⚙️ Job ${job.id} iniciando procesamiento`, job.data);
});

imageQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progreso:`, progress);
});

imageQueue.on('completed', async (job, result) => {
  try {
    console.log(`✅ Job ${job.id} completado:`, result);
    await job.moveToCompleted(result);
    await job.remove();
  } catch (err) {
    console.error(`Error finalizando job ${job.id}:`, err);
  }
});

imageQueue.on('failed', async (job, err) => {
  try {
    console.error(`❌ Job ${job.id} falló:`, err);
    await job.moveToFailed(err);
    if (job.attemptsMade < job.opts.attempts!) {
      await job.retry();
    }
  } catch (retryErr) {
    console.error(`Error retrying job ${job.id}:`, retryErr);
  }
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la cola:', error);
});