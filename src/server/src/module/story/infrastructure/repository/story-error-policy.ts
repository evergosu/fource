/* eslint-disable prettier/prettier */
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

import { Story } from '../../domain/story';



/**
 * ---
 * Defines the domain failure contract for the Story repository.
 * ---
 * Each operation maps to the precise set of domain failures
 * that may be produced after infrastructure error translation.
 */
export interface StoryFailureMap {
  getBySpecification: AggregatePersistenceFailure | AggregateNotFoundFailure;
  updateWithLock: AggregatePersistenceFailure | AggregateNotFoundFailure;
  create: AggregateAlreadyExistsFailure | AggregatePersistenceFailure;
  getById: AggregatePersistenceFailure | AggregateNotFoundFailure;
  getAll: AggregatePersistenceFailure | AggregateNotFoundFailure;
  delete: AggregatePersistenceFailure | AggregateNotFoundFailure;
}

export type _StoryFailureMapCheck = Exact<
  StoryFailureMap,
  RepositoryFailureMap
>;

/**
 * ---
 * Operation-indexed infrastructure-to-domain failure translators
 * for the Story repository.
 * ---
 * Each key corresponds to a repository operation and maps to a
 * function that converts an {@link InfrastructureFailures}
 * instance into the exact domain failure type declared in
 * {@link StoryFailureMap}.
 * ---
 * This structure guarantees:
 * - Exhaustiveness: all operations must be implemented.
 * - Type safety: each handler returns only failures allowed
 *   for its operation.
 * - Elimination of generic narrowing casts in the policy.
 */
type StoryErrorHandlers = {
  [K in keyof StoryFailureMap]: (
    error: InfrastructureFailures,
  ) => StoryFailureMap[K];
};

/**
 * ---
 * Shared translation logic for read-oriented Story operations.
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
    ? AggregateNotFoundFailure(Story.name)(error)
    : AggregatePersistenceFailure(Story.name)(error);

/**
 * ---
 * Concrete operation-aware error translation table for Story.
 * ---
 * This table centralizes all infrastructure error mapping logic.
 * It replaces control-flow based translation (e.g. switch statements)
 * with a structurally typed dispatch table.
 * ---
 * Adding a new operation to {@link StoryFailureMap} will produce
 * a compile-time error until a corresponding handler is defined here.
 */
const storyErrorHandlers: StoryErrorHandlers = {
  getBySpecification: readFailures,
  updateWithLock: readFailures,
  getById: readFailures,
  delete: readFailures,
  getAll: readFailures,

  create: error =>
    error._tag === 'UniqueViolationFailure'
      ? AggregateAlreadyExistsFailure(Story.name)(error)
      : AggregatePersistenceFailure(Story.name)(error),
};

/**
 * ---
 * Operation-aware error translation policy for the Story repository.
 * ---
 * Converts infrastructure failures into domain-specific failures
 * based on the semantic repository operation being executed.
 *
 * This class centralizes all infrastructure-to-domain error mapping
 * logic for the Story aggregate.
 */
export const StoryErrorPolicy: RepositoryErrorPolicy<StoryFailureMap> = {
  /**
   * ---
   * Translates an infrastructure failure into a domain failure
   * specific to the given Story repository operation.
   * ---
   * The return type is strictly derived from the operation key.
   * ---
   * @template K - Repository operation key.
   * @param operation - Operation being executed.
   */
  translate<K extends keyof StoryFailureMap>(operation: K) {
    return (error: InfrastructureFailures): StoryFailureMap[K] =>
      storyErrorHandlers[operation](error);
  }
}
