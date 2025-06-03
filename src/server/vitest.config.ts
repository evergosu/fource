import {
  defineConfig as defineViteConfig,
  searchForWorkspaceRoot,
  mergeConfig,
} from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// FIX: add vitest-cucumber settings, when issue get fixed
// https://github.com/amiceli/vitest-cucumber/issues/181
const viteConfig = defineViteConfig({
  optimizeDeps: {
    // Prevents errors in pnp, caused by attempts to work with virtual file system.
    exclude: ['@electric-sql/pglite'],
  },
  plugins: [tsconfigPaths()],
});

// Searching for workspace root helps IDE tools and plugins to detect correct setup.
const root = searchForWorkspaceRoot(process.cwd());

const vitestConfig = defineVitestConfig({
  test: {
    include: [`${root}/src/server/**/?(*.)+(spec|test).[jt]s?(x)`],
    setupFiles: [`${root}/src/server/vitest.setup.ts`],
    environment: 'node',
    globals: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig);
