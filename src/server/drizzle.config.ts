import { defineConfig } from 'drizzle-kit';

import { getEnvironment } from './src/lib/environment';

export default defineConfig({
  dbCredentials: {
    url: getEnvironment().server.database.url.toString(),
  },
  out: './src/database/migrations',
  schema: './src/database/schema',
  dialect: 'postgresql',
  verbose: true,
  strict: true,
});
