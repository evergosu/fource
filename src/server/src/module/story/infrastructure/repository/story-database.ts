/* eslint-disable prettier/prettier */
import type { DatabaseUpdateWithLock } from 'server/library/ddd/infrastructure/repository/capabilities/update-with-lock';
import type { DatabaseGetById } from 'server/library/ddd/infrastructure/repository/capabilities/get-by-id';
import type { DatabaseGetAll } from 'server/library/ddd/infrastructure/repository/capabilities/get-all';
import type { DatabaseCreate } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { DatabaseDelete } from 'server/library/ddd/infrastructure/repository/capabilities/delete';
import type { DatabaseUpdate } from 'server/library/ddd/infrastructure/repository/capabilities/update';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { DatabaseTransaction, Database } from 'server/infrastructure/database/database';

import {
  type StorySelectSchema,
  type StoryInsertSchema,
  type StoryUpdateSchema,
  story,
} from 'server/infrastructure/database/schema/story';
import { decodePostgresError } from 'server/infrastructure/database/clients/postgres/decode-error';
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
  implements
  DatabaseGetAll<StorySelectSchema>,
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
   * @param database - current database transaction.
   */
  constructor(private readonly database: DatabaseTransaction | Database) { }
  /** @inheritdoc */
  public getAll(): Task<StorySelectSchema[], InfrastructureFailures> {
    return Task.fromPromise(async () => await this.database.select().from(story)).mapError(error =>
      decodePostgresError(error),
    );
  }

  /** @inheritdoc */
  public getById(id: string): Task<StorySelectSchema[], never> {
    return Task.fromPromise(async () => await this.database.select().from(story).where(eq(story.id, id)));
  }

  /** @inheritdoc */
  public create(row: StoryInsertSchema): Task<void, InfrastructureFailures> {
    return Task.fromPromise(async () => {
      await this.database.insert(story).values(row);
    }).mapError(error => decodePostgresError(error));
  }

  /** @inheritdoc */
  public delete(id: string): Task<string[], InfrastructureFailures> {
    return Task.fromPromise(
      async () =>
        await this.database
          .delete(story)
          .where(eq(story.id, id))
          .returning()
          .then(rows => rows.map(row => row.id)),
    ).mapError(error => decodePostgresError(error));
  }

  /** @inheritdoc */
  public update(row: StoryUpdateSchema): Task<string[], InfrastructureFailures> {
    return Task.fromPromise(
      async () =>
        await this.database
          .update(story)
          .set(row)
          .where(eq(story.id, row.id))
          .returning()
          .then(rows => rows.map(row => row.id)),
    ).mapError(error => decodePostgresError(error));
  }

  /** @inheritdoc */
  public updateWithLock(row: StoryUpdateSchema): Task<string[], InfrastructureFailures> {
    return this.optimisticLockExecutor
      .execute(this.database.update(story).set(row).where(eq(story.id, row.id)).$dynamic(), row.version)
      .mapError(error => decodePostgresError(error));
  }
}
