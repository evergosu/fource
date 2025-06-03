import { type Table, sql } from 'drizzle-orm';
import { Logger } from 'server/lib/logger';

import type { Database } from '../database';

import { story } from '../schema/story';
import { seedStory } from './story';

export async function resetTable(database: Database, table: Table) {
  return database.execute(
    sql`truncate table ${table} restart identity cascade`,
  );
}

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
