import Bull from 'bull';

export const imageQueue = new Bull('image-processing', {
  redis: {
    port: 0,
    host: process.env.UPSTASH_REDIS_REST_URL!,
    password: process.env.UPSTASH_REDIS_REST_TOKEN!,
    tls: {
      rejectUnauthorized: false
    }
  },
  prefix: 'bull',
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

// Manejo de eventos con más logs
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