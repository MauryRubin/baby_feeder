/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  // Add specific Vercel configuration
  typescript: {
    // Ignore type errors in production build
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production'
  },
  eslint: {
    // Ignore ESLint errors in production build
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production'
  },
  // Add JSON serialization configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Add webpack configuration for date handling
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true
    };
    return config;
  }
}

export default nextConfig; 