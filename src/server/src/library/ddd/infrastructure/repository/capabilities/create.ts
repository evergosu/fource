import type { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Infrastructure capability: insert a row.
 */
export interface DatabaseCreate<Row> {
  /**
   * ---
   * Inserts a row from provided payload.
   * ---
   * @param row - row to insert.
   */
  create(row: Row): Task<void, unknown>;
}
