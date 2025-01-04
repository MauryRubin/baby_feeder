/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  // Add specific Vercel configuration
  typescript: {
    // Don't fail build on TS errors during deployment
    ignoreBuildErrors: false
  },
  eslint: {
    // Don't fail build on ESLint errors during deployment
    ignoreDuringBuilds: false
  }
}

export default nextConfig; 