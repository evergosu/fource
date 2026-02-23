import type { DatabaseCreateBatch } from 'server/library/ddd/infrastructure/repository/capabilities/create-batch';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { Database } from 'server/database/database';

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
   * @param database - The one of possible database clients.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly database: Database) { }

  /** @inheritdoc */
  public createBatch(
    rows: OutboxInsertSchema[],
  ): Task<void, InfrastructureFailures> {
    return Task.fromPromise(async () => {
      await this.database.insert(outbox).values(rows);
    }).mapError(error => decodePostgresError(error));
  }
}
