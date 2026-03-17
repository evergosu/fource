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

import { BanVote } from '../../domain/ban-vote';

/**
 * ---
 * Defines the domain failure contract for the BanVote repository.
 * ---
 * Each operation maps to the precise set of domain failures
 * that may be produced after infrastructure error translation.
 */
export interface BanVoteFailureMap {
  create: AggregateAlreadyExistsFailure | AggregatePersistenceFailure;
  delete: AggregatePersistenceFailure | AggregateNotFoundFailure;
  countById: AggregatePersistenceFailure;
}

export type _BanVoteFailureMapCheck = Exact<
  BanVoteFailureMap,
  RepositoryFailureMap
>;

/**
 * ---
 * Operation-indexed infrastructure-to-domain failure translators
 * for the BanVote repository.
 * ---
 * Each key corresponds to a repository operation and maps to a
 * function that converts an {@link InfrastructureFailures}
 * instance into the exact domain failure type declared in
 * {@link BanVoteFailureMap}.
 * ---
 * This structure guarantees:
 * - Exhaustiveness: all operations must be implemented.
 * - Type safety: each handler returns only failures allowed
 *   for its operation.
 * - Elimination of generic narrowing casts in the policy.
 */
type BanVoteErrorHandlers = {
  [K in keyof BanVoteFailureMap]: (
    error: InfrastructureFailures,
  ) => BanVoteFailureMap[K];
};

/**
 * ---
 * Shared translation logic for read-oriented BanVote operations.
 * ---
 * Maps infrastructure failures produced during retrieval
 * into appropriate domain failures.
 * ---
 * Used by operations that share identical failure semantics
 * (e.g. getAll, getById, getBySpecification).
 * ---
 * @param error - Infrastructure failure produced by persistence.
 */
const readFailures = (error: InfrastructureFailures) =>
  error._tag === 'ForeignKeyViolationFailure'
    ? AggregateNotFoundFailure(BanVote.name)(error)
    : AggregatePersistenceFailure(BanVote.name)(error);

/**
 * ---
 * Concrete operation-aware error translation table for BanVote.
 * ---
 * This table centralizes all infrastructure error mapping logic.
 * It replaces control-flow based translation (e.g. switch statements)
 * with a structurally typed dispatch table.
 * ---
 * Adding a new operation to {@link BanVoteFailureMap} will produce
 * a compile-time error until a corresponding handler is defined here.
 */
const banVoteErrorHandlers: BanVoteErrorHandlers = {
  create: error =>
    error._tag === 'UniqueViolationFailure'
      ? AggregateAlreadyExistsFailure(BanVote.name)(error)
      : AggregatePersistenceFailure(BanVote.name)(error),
  countById: AggregatePersistenceFailure(BanVote.name),
  delete: readFailures,
};

/**
 * ---
 * Operation-aware error translation policy for the BanVote repository.
 * ---
 * Converts infrastructure failures into domain-specific failures
 * based on the semantic repository operation being executed.
 *
 * This class centralizes all infrastructure-to-domain error mapping
 * logic for the BanVote aggregate.
 */
export const BanVoteErrorPolicy: RepositoryErrorPolicy<BanVoteFailureMap> = {
  /**
   * ---
   * Translates an infrastructure failure into a domain failure
   * specific to the given BanVote repository operation.
   * ---
   * The return type is strictly derived from the operation key.
   * ---
   * @template K - Repository operation key.
   * @param operation - Operation being executed.
   */
  translate<K extends keyof BanVoteFailureMap>(operation: K) {
    return (error: InfrastructureFailures): BanVoteFailureMap[K] =>
      banVoteErrorHandlers[operation](error);
  },
};
