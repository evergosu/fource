/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // Enabled in root scripts.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
