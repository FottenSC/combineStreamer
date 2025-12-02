import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
// Set to true if deploying to a custom domain at root (e.g., streams.horseface.no)
// Set to false if deploying to GitHub Pages subdirectory (e.g., username.github.io/combineStreamer)
const useCustomDomain = true;

const nextConfig: NextConfig = {
  // For GitHub Pages static hosting, we need output: 'export'
  // But this means API routes won't work - calls are made directly from client
  output: 'export',
  basePath: isProd && !useCustomDomain ? '/combineStreamer' : '',
  assetPrefix: isProd && !useCustomDomain ? '/combineStreamer' : '',
  trailingSlash: true,
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

