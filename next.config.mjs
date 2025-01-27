/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'wdddgjpmoxhfzehbhlvf.supabase.co',
      },
    ],
  },
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '25mb'
      },
      responseLimit: '25mb'
    }
  }
};

export default nextConfig;
