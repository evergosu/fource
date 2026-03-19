import type { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Middleware executed around command handler invocation.
 * ---
 * Enables:
 * - Logging
 * - Transactions
 * - Metrics
 * - Authorization
 * ---
 * @template MF - Additional failure type introduced by middleware.
 */
export interface CommandMiddleware<MF = never> {
  execute<Output, Failure>(command: unknown, next: () => Task<Output, Failure>): Task<Output, Failure | MF>;
}
