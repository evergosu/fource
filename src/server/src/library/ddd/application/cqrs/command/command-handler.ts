import type { Task } from 'server/library/ddd/primitives';

import type { TransactionEnvironment } from '../../unit-of-work/unit-of-work';
import type { Command } from './command';

/**
 * ---
 * Handles execution of a specific Command.
 * ---
 * @template C - command type
 * @template Output - Successful output type
 * @template Failure - Failure type
 */
export interface CommandHandler<C extends Command<Output, Failure>, Output, Failure> {
  /**
   * ---
   * Executes the given command.
   * ---
   * @param command - Command instance
   */
  handle(command: C, environment?: TransactionEnvironment): Task<Output, Failure>;
}
