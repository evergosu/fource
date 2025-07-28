import { type Table, sql } from 'drizzle-orm';
import { Logger } from 'library/tools/logger';

import type { Database } from '../database';

import { story } from '../schema/story';
import { seedStory } from './story';

/**
 * Database DSL method to reset single table with provided name.
 * @param database - current working database.
 * @param table - table name to reset.
 * @returns a Promise with result of SQL operation over database.
 */
export async function resetTable(database: Database, table: Table) {
  return database.execute(
    sql`truncate table ${table} restart identity cascade`,
  );
}

/**
 * Database DSL method to seed all tables with mock values.
 * @param database - current working database.
 */
export async function seedAll(database: Database) {
  const logger = new Logger({ style: 'colorful', level: 'success' });

  try {
    for (const table of [story]) {
      await resetTable(database, table);
    }

    for (const seed of [seedStory]) {
      await seed(database);
    }

    logger.success('Database: seed operation done.');
  } catch (error) {
    logger.error('Database: seed operation failed.', error);
  }
}
