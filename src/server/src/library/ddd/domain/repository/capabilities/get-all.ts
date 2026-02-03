import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Rehydrator,
  Task,
} from 'server/library/ddd/primitives';
import type { AggregateNotFoundFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Domain capability: Retrieve all aggregates from repository.
 */
export interface DomainGetAll<R extends Rehydrator<unknown, unknown, unknown>> {
  readonly rehydrator: R;

  /**
   * ---
   * Retrieves all aggregates from repository.
   * ---
   * - fails if an aggregate does not exist in the persistance.
   * - fails if an aggregate has failed rehydration step.
   */
  getAll(): Task<
    InferRehydratorDomain<R>[],
    InferRehydratorFailure<R>[] | AggregateNotFoundFailure
  >;
}
