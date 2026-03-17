import type {
  RepositoryErrorPolicy,
  RepositoryFailureMap,
} from 'server/library/ddd/domain/repository/repository-error-policy';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
import type { Exact } from 'server/library/ddd/types/exact';

import {
  AggregateAlreadyExistsFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';

/**
 * ---
 * Defines the domain failure contract for the Outbox repository.
 * ---
 * Each operation maps to the precise set of domain failures
 * that may be produced after infrastructure error translation.
 */
export interface OutboxFailureMap {
  getUnprocessedBatch: AggregatePersistenceFailure | AggregateNotFoundFailure;
  createBatch: AggregateAlreadyExistsFailure | AggregatePersistenceFailure;
  markProcessed: AggregatePersistenceFailure;
}

export type _OutboxFailureMapCheck = Exact<
  OutboxFailureMap,
  RepositoryFailureMap
>;

/**
 * ---
 * Operation-indexed infrastructure-to-domain failure translators
 * for the Outbox repository.
 * ---
 * Each key corresponds to a repository operation and maps to a
 * function that converts an {@link InfrastructureFailures}
 * instance into the exact domain failure type declared in
 * {@link OutboxFailureMap}.
 * ---
 * This structure guarantees:
 * - Exhaustiveness: all operations must be implemented.
 * - Type safety: each handler returns only failures allowed
 *   for its operation.
 * - Elimination of generic narrowing casts in the policy.
 */
type OutboxErrorHandlers = {
  [K in keyof OutboxFailureMap]: (
    error: InfrastructureFailures,
  ) => OutboxFailureMap[K];
};

/**
 * ---
 * Concrete operation-aware error translation table for Outbox.
 * ---
 * This table centralizes all infrastructure error mapping logic.
 * It replaces control-flow based translation (e.g. switch statements)
 * with a structurally typed dispatch table.
 * ---
 * Adding a new operation to {@link OutboxFailureMap} will produce
 * a compile-time error until a corresponding handler is defined here.
 */
const outboxErrorHandlers: OutboxErrorHandlers = {
  getUnprocessedBatch: error =>
    error._tag === 'ForeignKeyViolationFailure'
      ? AggregateNotFoundFailure('Outbox')(error)
      : AggregatePersistenceFailure('Outbox')(error),
  createBatch: error =>
    error._tag === 'UniqueViolationFailure'
      ? AggregateAlreadyExistsFailure('Outbox')(error)
      : AggregatePersistenceFailure('Outbox')(error),
  markProcessed: AggregatePersistenceFailure('Outbox'),
};

/**
 * ---
 * Operation-aware error translation policy for the Outbox repository.
 * ---
 * Converts infrastructure failures into domain-specific failures
 * based on the semantic repository operation being executed.
 *
 * This class centralizes all infrastructure-to-domain error mapping
 * logic for the Outbox aggregate.
 */
export const OutboxErrorPolicy: RepositoryErrorPolicy<OutboxFailureMap> = {
  /**
   * ---
   * Translates an infrastructure failure into a domain failure
   * specific to the given Outbox repository operation.
   * ---
   * The return type is strictly derived from the operation key.
   * ---
   * @template K - Repository operation key.
   * @param operation - Operation being executed.
   */
  translate<K extends keyof OutboxFailureMap>(operation: K) {
    return (error: InfrastructureFailures): OutboxFailureMap[K] =>
      outboxErrorHandlers[operation](error);
  },
};
