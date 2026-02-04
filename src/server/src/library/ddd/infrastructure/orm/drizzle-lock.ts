import type { AnyPgColumn, PgUpdate } from 'drizzle-orm/pg-core';

import { Task } from 'server/library/ddd/primitives';
import { eq } from 'drizzle-orm';

export interface LockedColumns {
  readonly version: AnyPgColumn;
  readonly id: AnyPgColumn;
}

interface OptimisticLockExecutor {
  execute(
    query: PgUpdate,
    version: number,
    id: string,
  ): Task<unknown[], unknown>;
}

/**
 * ---
 * Drizzle-ORM implementation of optimistic lock.
 */
export class DrizzleOptimisticLockExecutor
  // eslint-disable-next-line prettier/prettier
  implements OptimisticLockExecutor {
  /**
   * ---
   * Constructs optimistic lock executor for drizzle ORM.
   * ---
   * @param aggregate - Aggregate with required fields.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly aggregate: LockedColumns) { }

  /**
   * ---
   * Wraps a query with an optimistic lock checks over version field of table.
   * ---
   *  - error channel intentionally revealed as never
   *  - consumer must narrow error types manually
   * ---
   * @param query - Predefined query to perform lock for.
   * @param version - Version of an aggregate root.
   * @returns New query builder with optimistic lock checks.
   */
  execute(query: PgUpdate, version: number): Task<string[], never> {
    return Task.fromPromise(
      async () =>
        await query
          .where(eq(this.aggregate.version, version - 1))
          .returning({ id: this.aggregate.id })
          .then(rows => rows.map(row => String(row.id))),
    );
  }
}
