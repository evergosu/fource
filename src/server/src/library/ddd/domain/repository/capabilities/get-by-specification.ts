import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Rehydrator as R,
  Specification,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../repository-error-policy';
import type { AggregateSpecificationFailure } from '../repository-errors';
import type { NonEmptyArray } from '../../invariants/array/empty-array';
import type { DomainFailure } from '../../issues/failure';

/**
 * ---
 * Domain capability: Retrieve all aggregates that satisfy a given specification.
 * ---
 * Specifications encapsulate domain filtering logic and can be combined.
 */
export interface DomainGetBySpecification<
  Rehydrator extends R<unknown, Domain, DomainFailures>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferRehydratorDomain<Rehydrator>,
  DomainFailures extends DomainFailure = InferRehydratorFailure<Rehydrator>,
> extends RequiresErrorPolicy<GET_BY_SPECIFICATION_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves all aggregates that satisfy a given specification.
   * ---
   * @param specification - A specification that defines a business rule or filter.
   */
  getBySpecification(
    specification: Specification<Domain>,
  ): Task<
    NonEmptyArray<Domain>,
    | FailureMap[GET_BY_SPECIFICATION_OPERATION]
    | AggregateSpecificationFailure
    | DomainFailures
  >;
}

export type GET_BY_SPECIFICATION_OPERATION = 'getBySpecification';
