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
 */
export interface CommandMiddleware {
  execute<Output, Failure>(
    command: unknown,
    next: () => Task<Output, Failure>,
  ): Task<Output, Failure>;
}
