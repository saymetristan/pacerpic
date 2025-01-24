import Bull from 'bull';

const redisUrl = `rediss://:${process.env.UPSTASH_REDIS_REST_TOKEN}@${process.env.UPSTASH_REDIS_REST_HOST}:${process.env.UPSTASH_REDIS_REST_PORT}`;

export const imageQueue = new Bull('image-processing', redisUrl, {
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
imageQueue.on('ready', () => {
  console.log('📦 Cola conectada a Redis');
});

imageQueue.on('error', (error) => {
  console.error('❌ Error en la conexión Redis:', error);
});

imageQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completado`);
});

imageQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} falló:`, err);
});

imageQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} estancado`);
});