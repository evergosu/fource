import type { UniqueIdentifier, Task } from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../repository-error-policy';

/**
 * ---
 * Domain capability: Count an aggregate using provided unique identifier.
 */
export interface DomainCountById<FailureMap extends RFM>
  extends RequiresErrorPolicy<COUNT_BY_ID_OPERATION, FailureMap> {
  /**
   * ---
   * Retrieves count of an aggregate using provided unique identifier.
   * ---
   * @param id - The unique identifier of the domain entity.
   */
  [`countById`](
    id: UniqueIdentifier,
  ): Task<number, FailureMap[COUNT_BY_ID_OPERATION]>;
}

export type COUNT_BY_ID_OPERATION = 'countById';
