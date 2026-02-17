import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: update row with optimistic locking.
 * ---
 * This capability CANNOT exist without version awareness.
 */
export interface DatabaseUpdateWithLock<Row> {
  /**
   * ---
   * Updates a row from provided payload.
   * ---
   * @param row - row to update.
   */
  updateWithLock(row: Row): Task<string[], InfrastructureFailures>;
}
