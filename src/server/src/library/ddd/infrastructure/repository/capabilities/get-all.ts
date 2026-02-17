import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: retrieve all table rows.
 */
export interface DatabaseGetAll<Row> {
  /**
   * ---
   * Retrieves all table rows from persistance.
   */
  getAll(): Task<Row[], InfrastructureFailures>;
}
