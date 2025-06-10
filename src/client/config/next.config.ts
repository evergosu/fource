import type { NextConfig } from 'next';

import path from 'node:path';
import url from 'node:url';

import { getEnvironment } from '../src/lib/environment.js';

function resolve(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}

const environment = getEnvironment();

export default {
  webpack(config: { resolve: { alias: Record<string, string> } }) {
    const alias = {
      library: resolve(import.meta.url, '../library/src'),
      client: resolve(import.meta.url, './src'),
    };

    config.resolve.alias = alias;

    return config;
  },
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
