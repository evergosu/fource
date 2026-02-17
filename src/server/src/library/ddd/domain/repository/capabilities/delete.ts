import type { Entity, Task } from 'server/library/ddd/primitives';

import type {
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from '../repository-errors';

/**
 * ---
 * Domain capability: delete aggregate by provided unique identifier.
 */
export interface DomainDelete<Domain extends Entity<unknown>> {
  /**
   * ---
   * Deletes an aggregate by provided unique identifier.
   * ---
   * - fails if an aggregate does not exists in the persistance.
   * ---
   * @param id - The unique identifier of the domain entity.
   */
  delete(
    id: Domain['id'],
  ): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure>;
}
