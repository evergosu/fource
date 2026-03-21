import type { Entity, Task } from 'server/library/ddd/primitives';

import type { RepositoryFailureMap as RFM, RequiresErrorPolicy } from '../repository-error-policy';

/**
 * ---
 * Domain capability: delete aggregate by provided unique identifier.
 */
export interface DomainDelete<Domain extends Entity<unknown>, FailureMap extends RFM>
  extends RequiresErrorPolicy<DELETE_OPERATION, FailureMap> {
  /**
   * ---
   * Deletes an aggregate by provided unique identifier.
   * ---
   * @param entity - entity to create.
   */
  delete(entity: Domain): Task<void, FailureMap[DELETE_OPERATION]>;
}

export type DELETE_OPERATION = 'delete';
