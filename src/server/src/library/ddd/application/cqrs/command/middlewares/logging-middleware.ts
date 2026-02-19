import type { Task } from 'server/library/ddd/primitives';

import { Logger } from 'library/tools/logger';

import type { CommandMiddleware } from '../command-middleware';
import type { Command } from '../command';

/**
 * ---
 * Logs command execution.
 */
export class LoggingMiddleware implements CommandMiddleware {
  /**
   * ---
   * Performs logging operation and executes next command middleware.
   * ---
   * @param command - command object
   * @param next - command middleware
   */
  execute<O, F>(
    command: Command<unknown, unknown>,
    next: () => Task<O, F>,
  ): Task<O, F> {
    const logger = new Logger();

    logger.log(`Executing command: ${command.constructor.name}`);

    return next();
  }
}
