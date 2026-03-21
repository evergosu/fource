import { defineConfig } from 'drizzle-kit';

import { getEnvironment } from './src/library/environment';

export default defineConfig({
  dbCredentials: {
    url: getEnvironment().server.database.url.toString(),
  },
  out: './src/infrastructure/database/migrations',
  schema: './src/infrastructure/database/schema',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
});
