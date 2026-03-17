import type { DatabaseCreateBatch } from 'server/library/ddd/infrastructure/repository/capabilities/create-batch';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { DatabaseTransaction } from 'server/infrastructure/database/database';

import {
  type OutboxInsertSchema,
  type OutboxSelectSchema,
  outbox,
} from 'server/infrastructure/database/schema/outbox';
import { decodePostgresError } from 'server/infrastructure/database/clients/postgres/decode-error';
import { Task } from 'server/library/ddd/primitives';
import { isNull, asc, eq } from 'drizzle-orm';

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

  /**
   * ---
   * Fetches a batch of unprocessed outbox events.
   *
   * Uses row-level locking to ensure multiple workers can safely
   * process the outbox concurrently without duplicating work.
   *
   * Behavior:
   * - rows already locked by another worker are skipped
   * - rows returned by this query become locked for the current transaction
   * ---
   * @param limit - Maximum number of events to retrieve.
   * @returns Task resolving to a list of outbox rows.
   */
  public getUnprocessedBatch(
    limit: number,
  ): Task<OutboxSelectSchema[], InfrastructureFailures> {
    return Task.fromPromise(async () => {
      return this.transaction
        .select()
        .from(outbox)
        .where(isNull(outbox.processedAt))
        .orderBy(asc(outbox.occurredAt))
        .limit(limit)
        .for('update', { skipLocked: true });
    }).mapError(decodePostgresError);
  }

  /**
   * ---
   * Marks an outbox event as processed.
   * ---
   * @param id - Identifier of the processed event.
   */
  public markProcessed(id: string): Task<void, InfrastructureFailures> {
    return Task.fromPromise(async () => {
      await this.transaction
        .update(outbox)
        .set({
          processedAt: new Date(),
        })
        .where(eq(outbox.id, id));
    }).mapError(decodePostgresError);
  }
}
