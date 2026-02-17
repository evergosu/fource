import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Specification,
  Rehydrator,
  Task,
} from 'server/library/ddd/primitives';

import type {
  AggregateSpecificationFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from '../repository-errors';
import type { NonEmptyArray } from '../../invariants/array/empty-array';

/**
 * ---
 * Domain capability: Retrieve all aggregates that satisfy a given specification.
 * ---
 * Specifications encapsulate domain filtering logic and can be combined.
 */
export interface DomainGetBySpecification<
  R extends Rehydrator<unknown, unknown, unknown>,
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
    specification: Specification<InferRehydratorDomain<R>>,
  ): Task<
    NonEmptyArray<InferRehydratorDomain<R>>,
    | AggregateSpecificationFailure
    | AggregatePersistenceFailure
    | InferRehydratorFailure<R>
    | AggregateNotFoundFailure
  >;
}
