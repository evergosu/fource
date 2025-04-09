import {
  defineConfig as defineViteConfig,
  searchForWorkspaceRoot,
  mergeConfig,
} from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FIX: add vitest-cucumber settings, when issue get fixed
// https://github.com/amiceli/vitest-cucumber/issues/181
const viteConfig = defineViteConfig({
  plugins: [tsconfigPaths(), react()],
});

const vitestConfig = defineVitestConfig({
  test: {
    alias: {
      '@client': path.resolve(__dirname, '../client/src'),
      '@server': path.resolve(__dirname, '../server/src'),
    },
    setupFiles: [
      `${searchForWorkspaceRoot(process.cwd())}/src/tests/vitest.setup.ts`,
    ],
    environment: 'jsdom',
    globals: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig);
