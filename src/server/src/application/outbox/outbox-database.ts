import type { DatabaseCreateBatch } from 'server/library/ddd/infrastructure/repository/capabilities/create-batch';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { DatabaseTransaction } from 'server/database/database';

import { decodePostgresError } from 'server/database/clients/postgres/decode-error';
import { type OutboxInsertSchema, outbox } from 'server/database/schema/outbox';
import { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 * ---
 *  - error channel intentionally revealed as never
 *  - consumer must narrow error types manually
 */
export class OutboxDatabase implements DatabaseCreateBatch<OutboxInsertSchema> {
  /**
   * ---
   * Constructs a new `OutboxDatabase` instance.
   * ---
   * @param transaction - current database transaction.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly transaction: DatabaseTransaction) { }

  /** @inheritdoc */
  public createBatch(
    rows: OutboxInsertSchema[],
  ): Task<void, InfrastructureFailures> {
    return Task.fromPromise(async () => {
      await this.transaction.insert(outbox).values(rows);
    }).mapError(error => decodePostgresError(error));
  }
}
