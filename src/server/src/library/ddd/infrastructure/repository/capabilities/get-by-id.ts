import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Rehydrator,
  Entity,
  Task,
} from 'server/library/ddd/primitives';
import type { AggregateNotFoundFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Capability: Retrieve an aggregate using provided unique identifier.
 */
export interface GetById<
  R extends Rehydrator<unknown, Domain, unknown>,
  Domain extends Entity<unknown> = InferRehydratorDomain<R>,
> {
  readonly rehydrator: R;

  /**
   * ---
   * Retrieves an aggregate using provided unique identifier.
   * ---
   * - fails if an aggregate does not exist in the persistance.
   * - fails if an aggregate has failed rehydration step.
   * ---
   * @param id - The unique identifier of the domain entity.
   */
  getById(
    id: Domain['id'],
  ): Task<Domain, InferRehydratorFailure<R> | AggregateNotFoundFailure>;
}
