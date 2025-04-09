const nextConfig = {
  async rewrites() {
    return [
      {
        destination: `${process.env['NEXT_PUBLIC_API_URL']}/api/:path`,
        source: '/api/:path',
      },
    ];
  },
  eslint: {
    // Enabled in root scripts.
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
