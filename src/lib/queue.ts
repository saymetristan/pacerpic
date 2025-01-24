import Bull from 'bull';

const redisConfig = {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
};

export const imageQueue = new Bull('image-processing', {
  redis: redisConfig,
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