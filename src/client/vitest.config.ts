import {
  defineConfig as defineViteConfig,
  searchForWorkspaceRoot,
  mergeConfig,
} from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

const viteConfig = defineViteConfig({
  plugins: [tsconfigPaths(), react()],
});

const vitestConfig = defineVitestConfig({
  test: {
    setupFiles: [
      `${searchForWorkspaceRoot(process.cwd())}/src/client/vitest.setup.ts`,
    ],
    environment: 'jsdom',
    globals: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig);
