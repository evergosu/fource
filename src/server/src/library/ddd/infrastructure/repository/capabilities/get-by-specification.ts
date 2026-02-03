import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Specification,
  Rehydrator,
  Entity,
  Task,
} from 'server/library/ddd/primitives';
import type { AggregateNotFoundFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Capability: Retrieve all aggregates that satisfy a given specification.
 * ---
 * Specifications encapsulate domain filtering logic and can be combined.
 */
export interface GetBySpecification<
  Domain extends Entity<unknown>,
  R extends Rehydrator<unknown, Domain, unknown>,
> {
  readonly rehydrator: R;
  /**
   * ---
   * Retrieves all aggregates that satisfy a given specification.
   * ---
   * - fails if an aggregate does not exist in the persistance.
   * - fails if an aggregate has failed rehydration step.
   * ---
   * @param specification - A specification that defines a business rule or filter.
   */
  getBySpecification(
    specification: Specification<Domain>,
  ): Task<
    InferRehydratorDomain<R>[],
    InferRehydratorFailure<R>[] | AggregateNotFoundFailure
  >;
}
