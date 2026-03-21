import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: retrieve a row by record identifier.
 */
export interface DatabaseGetById<Row, Id> {
  /**
   * ---
   * Retrieves a row using provided record identifier.
   * ---
   * @param id - The identifier of the row record.
   */
  getById(id: Id): Task<Row[], InfrastructureFailures>;
}
