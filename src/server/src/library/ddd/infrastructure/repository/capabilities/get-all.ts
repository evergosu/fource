import type { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Infrastructure capability: retrieve all table rows.
 */
export interface DatabaseGetAll<Row> {
  /**
   * ---
   * Retrieves all table rows from persistance.
   */
  getAll(): Task<Row[], unknown>;
}
