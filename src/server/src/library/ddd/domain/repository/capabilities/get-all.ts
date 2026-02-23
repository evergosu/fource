import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Rehydrator as R,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../repository-error-policy';
import type { NonEmptyArray } from '../../invariants/array/empty-array';
import type { DomainFailure } from '../../issues/failure';

/**
 * ---
 * Domain capability: Retrieve all aggregates from repository.
 */
export interface DomainGetAll<
  Rehydrator extends R<unknown, Domain, DomainFailures>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferRehydratorDomain<Rehydrator>,
  DomainFailures extends DomainFailure = InferRehydratorFailure<Rehydrator>,
> extends RequiresErrorPolicy<GET_ALL_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves all aggregates from repository.
   */
  getAll(): Task<
    NonEmptyArray<Domain>,
    FailureMap[GET_ALL_OPERATION] | DomainFailures
  >;
}

export type GET_ALL_OPERATION = 'getAll';
