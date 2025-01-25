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
    lockDuration: 1800000,        // 30 minutos
    stalledInterval: 300000,      // 5 minutos
    maxStalledCount: 1,
    retryProcessDelay: 30000,     // 30 segundos
    lockRenewTime: 60000          // 1 minuto
  },
  limiter: {
    max: 1,
    duration: 300000             // 5 minutos
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
  // Solo reintentamos si falló
  job.retry().catch(console.error);
});

imageQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} estancado`);
  job.retry().catch(console.error);
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la cola:', error);
});