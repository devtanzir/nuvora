import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Local development - backend served images
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
