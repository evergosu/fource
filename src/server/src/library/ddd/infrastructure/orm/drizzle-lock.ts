import type { AnyPgColumn, PgUpdate } from 'drizzle-orm/pg-core';

import {
  AggregateConcurrencyFailure,
  StringFailure,
} from 'server/library/ddd/errors';
import { type UniqueIdentifier, Task } from 'server/library/ddd/primitives';
import { eq } from 'drizzle-orm';

import { GuardNonEmptyArray } from '../../domain/invariants/array/non-empty-array';
import { GuardString } from '../../domain/invariants/string/string';

export interface LockedColumns {
  readonly version: AnyPgColumn;
  readonly id: AnyPgColumn;
}

export interface OptimisticLockExecutor {
  execute(
    query: PgUpdate,
    version: number,
    id: UniqueIdentifier,
  ): Task<string, AggregateConcurrencyFailure | StringFailure>;
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
  execute(
    query: PgUpdate,
    version: number,
    id: UniqueIdentifier,
  ): Task<string, AggregateConcurrencyFailure | StringFailure> {
    return Task.fromPromise(
      async () =>
        await query
          .where(eq(this.aggregate.version, version - 1))
          .returning({ id: this.aggregate.id }),
    )
      .ensure(GuardNonEmptyArray.predicate, new AggregateConcurrencyFailure(id))
      .map(rows => rows[0])
      .refine(row => GuardString.refine(row.id, 'OptimisticLockId'));
  }
}
