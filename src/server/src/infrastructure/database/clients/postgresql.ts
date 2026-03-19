import { migrate as postgresMigrate } from 'drizzle-orm/node-postgres/migrator';
import { getEnvironment } from 'server/library/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { resolvePath } from 'library/resolve-path';
import { Logger } from 'library/tools/logger';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import os from 'node:os';

import type { DatabaseContext } from './client';

import { schema } from '../schema/schema';
import { seedAll } from '../seeds/all';

const environment = getEnvironment();

const logger = new Logger();

const pool = await connectToDatabase(logger);

export const database = drizzle(pool, {
  logger: environment.node === 'development' ? true : false,
  schema,
});

export type Postgres = typeof database;

/**
 * Creates concrete context for postgres database.
 * @param logger - custom logger to print system messages.
 * @returns postgres database context.
 */
export const createPostgresContext = async (logger: Logger): Promise<DatabaseContext> => {
  pool.on('error', error => {
    logger.error('Unexpected error at postgres client pool.', error);
  });

  await migrate(logger);

  return {
    async truncateAll() {
      const tableNames = Object.values(database._.tableNamesMap).filter(name => name !== '__drizzle_migrations');

      const tables = tableNames.map(name => `"${name}"`).join(', ');

      await database.execute(sql.raw(`truncate table ${tables} restart identity cascade`));
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

/**
 * Migrates database with persisted migrations.
 * @param logger - custom logger to print system messages.
 */
async function migrate(logger: Logger) {
  const migrationsFolder = resolvePath(import.meta.url, '../migrations');

  try {
    await postgresMigrate(database, { migrationsFolder });

    logger.success('Migrations done.');
  } catch (error) {
    throw new Error('Migrations failed due:', { cause: error });
  }
}

/**
 * Establishes connection to database with retry policy.
 * @param logger to print system messages.
 * @param retries - amount of attempts to connect.
 * @param baseDelay - time in milliseconds to strat delay from.
 * @returns `Pool` with database connection.
 */
async function connectToDatabase(logger: Logger, retries = 10, baseDelay = 500): Promise<Pool> {
  let lastError: unknown;

  const pool = new Pool({
    connectionString: environment.server.database.url.toString(),
    max: Math.min(os.cpus().length * 2, 16),
  });

  pool.on('error', error => {
    logger.error('Unexpected error at postgres client pool.', error);
  });

  for (let index = 0; index < retries; index++) {
    try {
      await pool.query('SELECT 1');
      return pool;
    } catch (error: unknown) {
      lastError = error;

      const delay = baseDelay * Math.pow(2, index);

      // Using Math.random() is safe here because security is not a concern.
      // eslint-disable-next-line sonarjs/pseudo-random
      const jitterDelay = delay + Math.floor(Math.random() * baseDelay);

      logger.warn(
        `Postgres connection retry ${String(index + 1)}/${String(retries)} failed, because of ${processError(error)}. Retrying in ${String(jitterDelay)}ms...`,
      );

      await new Promise(resolve => setTimeout(resolve, jitterDelay));
    }
  }

  throw new Error(
    `Postgres never became ready after ${String(retries)} retries.\nLast error: ${
      lastError instanceof Error ? String(lastError.stack) : String(lastError)
    }`,
  );
}

/**
 * Formats error messages from raw errors.
 * @param error - raw error to apply format.
 * @returns formatted error message.
 */
function processError(error: unknown) {
  if (error instanceof AggregateError) {
    const aggregateError = error as { code: string } & AggregateError;

    return `${aggregateError.name}: ${aggregateError.code}`;
  } else if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  } else {
    return 'Unknown error';
  }
}
