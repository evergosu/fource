import { migrate as postgresMigrate } from 'drizzle-orm/node-postgres/migrator';
import { migrate as pgliteMigrate } from 'drizzle-orm/pglite/migrator';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgliteDatabase } from 'drizzle-orm/pglite';
import { log } from 'node:console';
import path from 'node:path';
import url from 'node:url';

import type { Database } from './database';

function resolve(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}

export async function migrate(database: Database) {
  const migrationsFolder = resolve(import.meta.url, '../database/migrations');

  try {
    if (database instanceof PgliteDatabase) {
      await pgliteMigrate(database, { migrationsFolder });
    }

    if (database instanceof NodePgDatabase) {
      await postgresMigrate(database, { migrationsFolder });
    }

    log('migrations done');
  } catch (error) {
    throw new Error('migration failed due', { cause: error });
  }
}
