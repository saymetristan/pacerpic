import Bull from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false }
});

export const imageQueue = new Bull('image-processing', {
  redis: {
    port: parseInt(process.env.UPSTASH_REDIS_REST_PORT || '6379'),
    host: process.env.UPSTASH_REDIS_REST_HOST,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    tls: { rejectUnauthorized: false }
  },
  settings: {
    lockDuration: 300000, // 5 minutos
    stalledInterval: 30000,
    maxStalledCount: 3,
    retryProcessDelay: 5000
  },
  limiter: {
    max: 1000, // máximo de trabajos por intervalo
    duration: 5000 // intervalo en ms
  }
});

// Manejo de eventos
imageQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completado`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} falló:`, err);
});

imageQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} estancado`);
});