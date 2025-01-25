import Bull from 'bull';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const imageQueue = new Bull('image-processing', {
  redis: {
    host: process.env.UPSTASH_REDIS_REST_URL!,
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
    tls: { rejectUnauthorized: false }
  },
  prefix: 'bull',
  settings: {
    lockDuration: 300000,
    stalledInterval: 30000,
    maxStalledCount: 3,
    retryProcessDelay: 5000
  }
});

// Eventos para debugging con más detalles
imageQueue.on('active', (job) => {
  console.log(`⚙️ Job ${job.id} iniciando procesamiento`, job.data);
});

imageQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progreso:`, progress);
});

imageQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completado:`, result);
});

imageQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} falló:`, err);
});

imageQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} estancado, reintentando...`);
  job.retry();
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la cola:', error);
});