import type { Task } from 'server/library/ddd/primitives';

import type { Command } from './command';

/**
 * ---
 * Handles execution of a specific Command.
 * ---
 * @template C - command type
 * @template Output - Successful output type
 * @template Failure - Failure type
 */
export interface CommandHandler<
  C extends Command<Output, Failure>,
  Output,
  Failure,
> {
  /**
   * ---
   * Executes the given command.
   * ---
   * @param command - Command instance
   */
  handle(command: C): Task<Output, Failure>;
}
