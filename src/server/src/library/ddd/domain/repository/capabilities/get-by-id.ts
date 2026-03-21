import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  Rehydrator as R,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type { RepositoryFailureMap as RFM, RequiresErrorPolicy } from '../repository-error-policy';
import type { DomainFailure } from '../../issues/failure';

/**
 * ---
 * Domain capability: Retrieve an aggregate using provided unique identifier.
 */
export interface DomainGetById<
  Rehydrator extends R<unknown, Domain, DomainFailures>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferRehydratorDomain<Rehydrator>,
  DomainFailures extends DomainFailure = InferRehydratorFailure<Rehydrator>,
> extends RequiresErrorPolicy<GET_BY_ID_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves an aggregate using provided unique identifier.
   * ---
   * @param id - The unique identifier of the domain entity.
   */
  getById(id: Domain['id']): Task<Domain, FailureMap[GET_BY_ID_OPERATION] | DomainFailures>;
}

export type GET_BY_ID_OPERATION = 'getById';
