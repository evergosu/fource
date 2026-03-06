import type { Task } from 'server/library/ddd/primitives';

import type { Query } from './query';

/**
 * ---
 * Middleware executed around query dispatch.
 * ---
 * Query middleware enables cross-cutting concerns
 * for the read side of the system.
 * ---
 * Typical use cases:
 * - logging
 * - metrics
 * - caching
 * - authorization
 * ---
 * @template MF - Additional failure type introduced by middleware.
 */
export interface QueryMiddleware<MF = never> {
  /**
   * ---
   * Executes middleware logic.
   * ---
   * @param query - Query being dispatched.
   * @param next - Next middleware or handler in the pipeline.
   */
  execute<O, F>(query: Query<O, F>, next: () => Task<O, F>): Task<O, MF | F>;
}
