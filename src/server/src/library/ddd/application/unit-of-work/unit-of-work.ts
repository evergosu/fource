import type { AggregateTracker } from 'server/infrastructure/orm/unit-of-work/aggregate-tracker';
import type { Task } from 'server/library/ddd/primitives';

import type { TransactionalDatabaseProvider } from '../../domain/repository/repository-provider';

import {
  type InfrastructureFailure,
  infrastructureFailure,
} from '../../domain/issues/failure';

/**
 * ---
 * Transaction coordinator responsible for executing effectful programs
 * inside a database transaction while guaranteeing reliable persistence
 * of domain events via the Outbox pattern.
 * ---
 * The Unit of Work coordinates three concerns:
 *
 * 1. **Transactional boundary**
 *    Ensures all database operations run inside a single transaction.
 *
 * 2. **Domain event extraction**
 *    Aggregates modified during execution register themselves through
 *    an {@link AggregateTracker.track}. After the domain logic completes,
 *    the Unit of Work extracts the events.
 *
 * 3. **Outbox persistence**
 *    Extracted events are persisted to an Outbox table within the same
 *    transaction. This guarantees that domain state and emitted events
 *    remain consistent.
 * ---
 * 1. Begin database transaction
 * 2. Execute the provided effect program
 * 3. If program fails → rollback
 * 4. Collect domain events from tracked aggregates
 * 5. Persist events into Outbox
 * 6. If outbox write fails → rollback
 * 7. Commit transaction
 */
export interface UnitOfWork {
  /**
   * ---
   * Executes a transactional effect program.
   * ---
   * The provided program receives an execution environment containing:
   *
   * - a transactional repository provider
   * - an aggregate tracker used to collect domain events
   *
   * The program must return a {@link Task} representing domain logic.
   *
   * If the program fails, the transaction is rolled back.
   * If persisting domain events fails, the transaction is also rolled back.
   * ---
   * @template Output Successful result type.
   * @template Failure Domain failure type produced by the program.
   * @param work Effectful domain program executed within the transaction.
   * @returns Task resolving to the program result or a UnitOfWorkFailure.
   */
  execute<Output, Failure>(
    work: (environment: TransactionEnvironment) => Task<Output, Failure>,
  ): Task<Output, UnitOfWorkFailure>;
}

/**
 * ---
 * Transaction execution environment provided to effect programs.
 * ---
 * The environment allows use cases to remain independent from concrete
 * transaction implementations while still participating in the same
 * transactional boundary.
 * ---
 * `provider`
 *    Factory responsible for constructing repository database adapters
 *    bound to the current transaction.
 *
 * `tracker`
 *    Tracks aggregates that produced domain events during execution.
 */
export interface TransactionEnvironment {
  provider: TransactionalDatabaseProvider;
  tracker: AggregateTracker;
}

/**
 * ---
 * Infrastructure-level failure produced by the Unit of Work.
 *
 * This error represents failures related to transaction execution
 * or infrastructure interactions rather than domain logic.
 */
export type UnitOfWorkFailure = {
  readonly _tag: 'UnitOfWorkFailure';
  readonly cause: unknown;
} & InfrastructureFailure;

/**
 * ---
 * Constructs a {@link UnitOfWorkFailure}.
 * ---
 * @param cause Underlying infrastructure error.
 */
// eslint-disable-next-line sonarjs/no-redeclare
export const UnitOfWorkFailure = (cause: unknown): UnitOfWorkFailure =>
  infrastructureFailure({ _tag: 'UnitOfWorkFailure', cause });
