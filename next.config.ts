import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable standalone build for self-hosting
  output: 'standalone',

  // Optimize for production
  compress: true,
  poweredByHeader: false,

  // Image optimization for self-hosting
  images: {
    unoptimized: false, // Keep optimization enabled
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com', // Your domain
      },
    ],
  },

  // External packages for server components
  serverExternalPackages: [],
};

export default nextConfig;
