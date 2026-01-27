import type { AnyPgColumn, PgUpdate } from 'drizzle-orm/pg-core';

import { type UniqueIdentifier, Result } from 'server/library/ddd/primitives';
import { AggregateConcurrencyFailure } from 'server/library/ddd/errors';
import { eq } from 'drizzle-orm';

export interface LockedColumns {
  readonly version: AnyPgColumn;
  readonly id: AnyPgColumn;
}

export interface OptimisticLockExecutor {
  execute(
    query: PgUpdate,
    version: number,
    id: UniqueIdentifier,
  ): Promise<Result<UniqueIdentifier, AggregateConcurrencyFailure>>;
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
   * @param query - Predefined query to perform lock for.
   * @param version - Version of an aggregate root.
   * @param id - Unique identifier of an aggregate root.
   * @returns New query builder with optimistic lock checks.
   */
  async execute(
    query: PgUpdate,
    version: number,
    id: UniqueIdentifier,
  ): Promise<Result<UniqueIdentifier, AggregateConcurrencyFailure>> {
    const result = await query
      .where(eq(this.aggregate.version, version - 1))
      .returning({ id: this.aggregate.id });

    return Result.fromBoolean(
      result.length > 0,
      new AggregateConcurrencyFailure(id),
      id,
    );
  }
}
