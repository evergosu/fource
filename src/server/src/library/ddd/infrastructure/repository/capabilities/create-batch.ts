import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: insert a few rows.
 */
export interface DatabaseCreateBatch<Row> {
  /**
   * ---
   * Inserts a few rows from provided payload.
   * ---
   * @param rows - rows to insert.
   */
  createBatch(rows: Row[]): Task<void, InfrastructureFailures>;
}
