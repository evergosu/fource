/* eslint-disable prettier/prettier */
import type { DatabaseUpdateWithLock } from 'server/library/ddd/infrastructure/repository/capabilities/update-with-lock';
import type { DatabaseGetById } from 'server/library/ddd/infrastructure/repository/capabilities/get-by-id';
import type { DatabaseGetAll } from 'server/library/ddd/infrastructure/repository/capabilities/get-all';
import type { DatabaseCreate } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { DatabaseDelete } from 'server/library/ddd/infrastructure/repository/capabilities/delete';
import type { DatabaseUpdate } from 'server/library/ddd/infrastructure/repository/capabilities/update';
import type { Database } from 'server/database/database';

import {
  type StoryInsertSchema,
  type StorySelectSchema,
  type StoryUpdateSchema,
  story,
} from 'server/database/schema/story';
import { DrizzleOptimisticLockExecutor } from 'server/library/ddd/infrastructure/orm/drizzle-lock';
import { Task } from 'server/library/ddd/primitives';
import { eq } from 'drizzle-orm';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 * ---
 *  - error channel intentionally revealed as never
 *  - consumer must narrow error types manually
 */
export class StoryDatabase
  implements DatabaseGetAll<StorySelectSchema>,
  DatabaseGetById<StorySelectSchema, string>,
  DatabaseCreate<StoryInsertSchema>,
  DatabaseDelete<string>,
  DatabaseUpdate<StoryUpdateSchema>,
  DatabaseUpdateWithLock<StoryUpdateSchema> {
  private readonly optimisticLockExecutor = new DrizzleOptimisticLockExecutor(story);

  /**
   * ---
   * Constructs a new `StoryDatabase` instance.
   * ---
   * @param database - The one of possible database clients.
   */
  constructor(private readonly database: Database) { }
  /** @inheritdoc */
  public getAll(): Task<StorySelectSchema[], never> {
    return Task.fromPromise(
      async () => await this.database.select().from(story),
    );
  }

  /** @inheritdoc */
  public getById(id: string): Task<StorySelectSchema[], never> {
    return Task.fromPromise(
      async () =>
        await this.database.select().from(story).where(eq(story.id, id)),
    );
  }

  /** @inheritdoc */
  public create(row: StoryInsertSchema): Task<void, never> {
    return Task.fromPromise(async () => {
      await this.database.insert(story).values(row);
    });
  }

  /** @inheritdoc */
  public delete(id: string): Task<string[], never> {
    return Task.fromPromise(
      async () =>
        await this.database
          .delete(story)
          .where(eq(story.id, id))
          .returning()
          .then(rows => rows.map(row => row.id)),
    );
  }

  /** @inheritdoc */
  public update(row: StoryUpdateSchema): Task<string[], never> {
    return Task.fromPromise(
      async () =>
        await this.database
          .update(story)
          .set(row)
          .where(eq(story.id, row.id))
          .returning()
          .then(rows => rows.map(row => row.id)),
    );
  }

  /** @inheritdoc */
  public updateWithLock(row: StoryUpdateSchema): Task<string[], never> {
    return this.optimisticLockExecutor.execute(
      this.database
        .update(story)
        .set(row)
        .where(eq(story.id, row.id))
        .$dynamic(),
      row.version,
    );
  }
}
