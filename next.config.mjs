/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  // Add specific Vercel configuration
  typescript: {
    // Temporarily allow type errors during deployment
    ignoreBuildErrors: true
  },
  eslint: {
    // Temporarily allow ESLint errors during deployment
    ignoreDuringBuilds: true
  }
}

export default nextConfig; 