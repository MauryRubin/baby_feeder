/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  // Add specific Vercel configuration
  typescript: {
    // Temporarily enable during development
    ignoreBuildErrors: true
  },
  eslint: {
    // Temporarily enable during development
    ignoreDuringBuilds: true
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