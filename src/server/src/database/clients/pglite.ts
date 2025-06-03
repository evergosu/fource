import type { Logger } from 'server/lib/logger';

import { migrate as pgliteMigrate } from 'drizzle-orm/pglite/migrator';
import { PgliteDatabase, drizzle } from 'drizzle-orm/pglite';
import { getEnvironment } from 'server/lib/environment';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import url from 'node:url';

import { type Schema, schema } from '../schema/schema';
import { DatabaseContext } from './client';
import { seedAll } from '../seeds/all';

const environment = getEnvironment();

export type PostgresLite = PgliteDatabase<Schema>;

export const createPostgresLiteContext = async (
  logger: Logger,
): Promise<DatabaseContext> => {
  const client = new PGlite();

  const database = drizzle(client, {
    logger: environment.node === 'development' ? true : false,
    schema,
  });

  async function migrate() {
    const migrationsFolder = resolve(import.meta.url, '../migrations');

    try {
      await pgliteMigrate(database, { migrationsFolder });

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
      await client.close();

      logger.success('The PGlite client has been stopped gracefully.');
    },
    getClient(): PostgresLite {
      return database;
    },
    seed: () => seedAll(database),
    migrate: migrate,
  };
};

function resolve(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}
