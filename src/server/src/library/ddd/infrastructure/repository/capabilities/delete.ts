import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: delete row by id.
 */
export interface DatabaseDelete<Id> {
  /**
   * ---
   * Deletes a row by provided identifier.
   * ---
   * @param id - The identifier of the row record.
   */
  delete(id: Id): Task<string[], InfrastructureFailures>;
}
