/* eslint-disable prettier/prettier */
import type { DatabaseCountById } from 'server/library/ddd/infrastructure/repository/capabilities/count-by-id';
import type { DatabaseCreate } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { DatabaseDelete } from 'server/library/ddd/infrastructure/repository/capabilities/delete';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { DatabaseTransaction, Database } from 'server/database/database';

import {
  type BanVoteInsertSchema,
  banVote,
} from 'server/database/schema/ban-vote';
import { decodePostgresError } from 'server/database/clients/postgres/decode-error';
import { Task } from 'server/library/ddd/primitives';
import { count, eq } from 'drizzle-orm';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 * ---
 *  - error channel intentionally revealed as never
 *  - consumer must narrow error types manually
 */
export class BanVoteDatabase
  implements
  DatabaseCreate<BanVoteInsertSchema>,
  DatabaseDelete<string>,
  DatabaseCountById {
  /**
   * ---
   * Constructs a new `BanVoteDatabase` instance.
   * ---
   * @param database - current database transaction.
   */
  constructor(private readonly database: DatabaseTransaction | Database) { }

  /** @inheritdoc */
  public create(row: BanVoteInsertSchema): Task<void, InfrastructureFailures> {
    return Task.fromPromise(async () => {
      await this.database.insert(banVote).values(row);
    }).mapError(error => decodePostgresError(error));
  }

  /** @inheritdoc */
  public delete(id: string): Task<string[], InfrastructureFailures> {
    return Task.fromPromise(
      async () =>
        await this.database
          .delete(banVote)
          .where(eq(banVote.id, id))
          .returning()
          .then(rows => rows.map(row => row.id)),
    ).mapError(error => decodePostgresError(error));
  }

  /** @inheritdoc */
  public countById(id: string): Task<number, InfrastructureFailures> {
    return Task.fromPromise(
      async () =>
        await this.database
          .select({ count: count() })
          .from(banVote)
          .where(eq(banVote.storyId, id)),
    )
      .map(result => result[0]?.count ?? 0)
      .mapError(error => decodePostgresError(error));
  }
}
