import type { Specification, Task } from 'server/library/ddd/primitives';

import type { RepositoryFailureMap as RFM, RequiresErrorPolicy } from '../repository-error-policy';
import type { AggregateSpecificationFailure } from '../repository-errors';
import type { NonEmptyArray } from '../../invariants/array/empty-array';

/**
 * ---
 * Domain capability: Retrieve all aggregates that satisfy a given specification.
 * ---
 * Specifications encapsulate domain filtering logic and can be combined.
 */
export interface DomainGetBySpecification<Output, FailureMap extends RFM>
  extends RequiresErrorPolicy<GET_BY_SPECIFICATION_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves all aggregates that satisfy a given specification.
   * ---
   * @param specification - A specification that defines a business rule or filter.
   */
  getBySpecification(
    specification: Specification<Output>,
  ): Task<NonEmptyArray<Output>, FailureMap[GET_BY_SPECIFICATION_OPERATION] | AggregateSpecificationFailure>;
}

export type GET_BY_SPECIFICATION_OPERATION = 'getBySpecification';
