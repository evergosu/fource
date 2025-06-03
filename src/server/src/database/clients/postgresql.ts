import type { Logger } from 'server/lib/logger';

import { migrate as postgresMigrate } from 'drizzle-orm/node-postgres/migrator';
import { getEnvironment } from 'server/lib/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import url from 'node:url';
import { Pool } from 'pg';
import os from 'node:os';

import type { DatabaseContext } from './client';

import { schema } from '../schema/schema';
import { seedAll } from '../seeds/all';

const environment = getEnvironment();

const pool = new Pool({
  connectionString: environment.server.database.url.toString(),
  max: Math.min(os.cpus().length * 2, 16),
});

export const database = drizzle(pool, {
  logger: environment.node === 'development' ? true : false,
  schema,
});

export type Postgres = typeof database;

export const createPostgresContext = async (
  logger: Logger,
): Promise<DatabaseContext> => {
  pool.on('error', error => {
    logger.error('Unexpected error at postgres client pool.', error);
  });

  async function migrate() {
    const migrationsFolder = resolve(import.meta.url, '../migrations');

    try {
      await postgresMigrate(database, { migrationsFolder });

      logger.success('Migrations done.');
    } catch (error) {
      throw new Error('Migrations failed due:', { cause: error });
    }
  }

  await migrate();

  return {
    async truncateAll() {
      const tableNames = Object.values(database._.tableNamesMap).filter(
        name => name !== '__drizzle_migrations',
      );

      const tables = tableNames.map(name => `"${name}"`).join(', ');

      await database.execute(
        sql.raw(`truncate table ${tables} restart identity cascade`),
      );
    },
    async close() {
      await pool.end();

      logger.success('The Postgres client has been stopped gracefully.');
    },
    getClient(): Postgres {
      return database;
    },
    seed: () => seedAll(database),
    migrate: migrate,
  };
};

function resolve(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}
