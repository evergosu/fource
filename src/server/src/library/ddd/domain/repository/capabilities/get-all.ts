import type { Task } from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../repository-error-policy';
import type { NonEmptyArray } from '../../invariants/array/empty-array';

/**
 * ---
 * Domain capability: Retrieve all aggregates from repository.
 */
export interface DomainGetAll<Output, FailureMap extends RFM>
  extends RequiresErrorPolicy<GET_ALL_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves all aggregates from repository.
   */
  getAll(): Task<NonEmptyArray<Output>, FailureMap[GET_ALL_OPERATION]>;
}

export type GET_ALL_OPERATION = 'getAll';
