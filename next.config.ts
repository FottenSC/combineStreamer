import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: 'output: export' removed to enable API routes for server-side fetching
  // This avoids CORS issues with external APIs (Invidious, Twitch)
  basePath: process.env.NODE_ENV === 'production' ? '/combineStreamer' : '',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'static-cdn.jtvnw.net',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.kick.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;

