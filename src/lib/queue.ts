import Bull from 'bull';

// Limpiamos la URL de Redis
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!.replace('https://', '');

export const imageQueue = new Bull('image-processing', {
  redis: {
    port: 6379,
    host: REDIS_URL,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
    tls: {
      rejectUnauthorized: false
    }
  },
  prefix: 'bull',
  settings: {
    lockDuration: 300000,
    stalledInterval: 30000,
    maxStalledCount: 3,
    retryProcessDelay: 5000
  },
  limiter: {
    max: 1000,
    duration: 5000
  }
});

// Eventos para debugging
imageQueue.on('active', (job) => {
  console.log(`⚙️ Job ${job.id} iniciando procesamiento`);
});

imageQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completado exitosamente`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} falló:`, err);
});

imageQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} estancado`);
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la cola:', error);
});