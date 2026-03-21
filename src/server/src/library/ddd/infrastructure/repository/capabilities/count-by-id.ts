import type { Task } from 'server/library/ddd/primitives';

import type { InfrastructureFailures } from '../../infrastructure-errors';

/**
 * ---
 * Infrastructure capability: count amount by identifier.
 */
export interface DatabaseCountById {
  /**
   * ---
   * Retrieves amount of records with identifier.
   * ---
   * @param id - The Identifier of the entity whose records should be counted.
   */
  countById(id: string): Task<number, InfrastructureFailures>;
}
