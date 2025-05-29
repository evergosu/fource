import type { NextConfig } from 'next';

import { getEnvironment } from '../src/lib/environment.js';

const environment = getEnvironment();

export default {
  eslint: {
    // Enabled in root scripts.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_ORIGIN: environment.client.url.origin,
  },
  // Prevents errors in pnp, caused by attempts to work with virtual file system.
  serverExternalPackages: ['@electric-sql/pglite'],
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
} satisfies NextConfig;
