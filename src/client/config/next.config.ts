import type { NextConfig } from 'next';

import { getEnvironment } from './environment.js';

declare global {
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    interface ProcessEnv {
      NEXT_PUBLIC_ORIGIN: string;
    }
  }
}

const environment = getEnvironment();

export default {
  // eslint-disable-next-line @typescript-eslint/require-await
  async rewrites() {
    return [
      {
        destination: `${environment.server.url.origin}/api/:path*`,
        source: '/api/:path*',
      },
    ];
  },
  eslint: {
    // Enabled in root scripts.
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_ORIGIN: environment.client.url.origin,
  },
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
} satisfies NextConfig;
