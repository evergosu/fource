import { defineConfig as defineViteConfig, searchForWorkspaceRoot, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

// eslint-disable-next-line no-restricted-imports
import { resolvePath } from '../library/src/resolve-path';
import nextConfig from '../client/next.config';

// FIX: add vitest-cucumber settings, when issue get fixed
// https://github.com/amiceli/vitest-cucumber/issues/181
const viteConfig = defineViteConfig({
  optimizeDeps: {
    // Prevents errors in pnp, caused by attempts to work with virtual file system.
    exclude: ['@electric-sql/pglite'],
  },
  plugins: [tsconfigPaths(), react()],
});

// Searching for workspace root helps IDE tools and plugins to detect correct setup.
const root = searchForWorkspaceRoot(process.cwd());

const vitestConfig = defineVitestConfig({
  test: {
    hookTimeout: 10_000,
    testTimeout: 10_000,
    alias: {
      library: resolvePath(import.meta.url, '../library/src'),
      client: resolvePath(import.meta.url, '../client/src'),
      server: resolvePath(import.meta.url, '../server/src'),
    },
    include: [`${root}/src/tests/**/?(*.)+(spec|test).[jt]s?(x)`],
    setupFiles: [`${root}/src/tests/vitest.setup.ts`],
    env: {
      ...nextConfig.env,
    },
    environment: 'jsdom',
    globals: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig);
