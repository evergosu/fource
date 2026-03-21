import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: update a row.
 */
export interface DatabaseUpdate<Row> {
  /**
   * ---
   * Updates a row from provided payload.
   * ---
   * @param row - row to update.
   */
  update(row: Row): Task<string[], InfrastructureFailures>;
}
