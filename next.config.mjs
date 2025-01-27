/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
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
  webpack: (config) => {
    config.externals.push({
      'sharp': 'commonjs sharp'
    });
    return config;
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
