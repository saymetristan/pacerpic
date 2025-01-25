import Bull from 'bull';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL!.replace('https://', '');
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

export const imageQueue = new Bull('image-processing', {
  redis: `rediss://:${REDIS_TOKEN}@${REDIS_URL}:6379?ssl_cert_reqs=none`,
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

// Mantenemos los mismos eventos
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