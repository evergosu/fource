import type { Logger } from 'server/lib/logger';

import { PgliteDatabase, drizzle } from 'drizzle-orm/pglite';
import { getEnvironment } from 'server/lib/environment';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';

import { type Schema, schema } from '../schema/schema';
import { DatabaseContext } from './client';
import { migrate } from '../migrate';

const environment = getEnvironment();

export type PostgresLite = PgliteDatabase<Schema>;

export const createPostgresLiteContext = async (
  logger: Logger,
): Promise<DatabaseContext> => {
  const client = new PGlite();

  const database = drizzle(client, {
    logger: environment.node !== 'production',
    schema,
  });

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
      await client.close();

      logger.success('The PGlite client has been stopped gracefully.');
    },
    getClient(): PostgresLite {
      return database;
    },
  };
};
