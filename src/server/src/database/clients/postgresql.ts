import type { Logger } from 'server/lib/logger';

import { getEnvironment } from 'server/lib/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import os from 'node:os';

import type { DatabaseContext } from './client';

import { schema } from '../schema/schema';
import { seedAll } from '../seeds/all';
import { migrate } from '../migrate';

const environment = getEnvironment();

const pool = new Pool({
  connectionString: environment.server.database.url.toString(),
  max: Math.min(os.cpus().length * 2, 16),
});

pool.on('error', error => {
  console.error('Unexpected error at postgres client pool.', error);
});

export const database = drizzle(pool, {
  logger: environment.node === 'development',
  schema,
});

export type Postgres = typeof database;

export const createPostgresContext = async (
  logger: Logger,
): Promise<DatabaseContext> => {
  await migrate(database);

  return {
    async truncateAll() {
      const tableNames = Object.values(database._.tableNamesMap).filter(
        name => name !== '__drizzle_migrations',
      );

      const tables = tableNames.map(name => `"${name}"`).join(', ');

      await database.execute(
        sql.raw(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`),
      );
    },
    async close() {
      await pool.end();

      logger.success('The Postgres client has been stopped gracefully.');
    },
    getClient(): Postgres {
      return database;
    },
  };
};

export async function seed() {
  await seedAll(database);
}
