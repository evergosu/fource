import type { Task } from 'server/library/ddd/primitives';

import { Exception } from 'server/library/ddd/domain/issues/exception';

import type { TransactionEnvironment } from '../../unit-of-work/unit-of-work';
import type { CommandMiddleware } from './command-middleware';
import type { CommandHandler } from './command-handler';
import type { Command } from './command';

/**
 * ---
 * In-memory implementation of CommandBus.
 * ---
 * Responsibilities:
 * - Registers handlers
 * - Dispatches commands
 * - Applies middleware pipeline
 */
export class InMemoryCommandBus {
  private readonly handlers = new Map<
    string,
    CommandHandler<object, unknown, unknown>
  >();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly middleware: CommandMiddleware<any>[] = [];

  /**
   * ---
   * Registers a handler for a given Command constructor.
   * ---
   * @param command - command object
   * @param handler - handler for command object
   */
  register<C extends Command<O, F>, O, F>(
    command: new (...as: never) => C,
    handler: CommandHandler<C, O, F>,
  ): void {
    this.handlers.set(command.name, handler);
  }

  /**
   * ---
   * Adds middleware to pipeline.
   * ---
   * @param middleware - command middleware
   */
  use(middleware: CommandMiddleware<unknown>): void {
    this.middleware.push(middleware);
  }

  /**
   * ---
   * Dispatches a command to its registered handler.
   * ---
   * @param command - command object
   * @param handler - handler for command object
   */
  private composeMiddleware<O, F>(
    command: unknown,
    handler: () => Task<O, F>,
  ): () => Task<O, F> {
    // eslint-disable-next-line unicorn/no-array-reduce
    return this.middleware.toReversed().reduce((next, middleware) => {
      return () => middleware.execute(command, next);
    }, handler);
  }

  /**
   * ---
   * Dispatches command into memory command bus.
   * ---
   * @param command - command object
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  dispatch<C extends Command<Output, Failure>, Output, Failure>(
    command: C,
  ): Task<Output, Failure> {
    const handler = this.handlers.get(command.constructor.name) as
      | CommandHandler<C, Output, Failure>
      | undefined;

    if (!handler) {
      throw new CommandHandlerExcepcion(
        `No handler registered for ${command.constructor.name}`,
      );
    }

    const pipeline = this.composeMiddleware(
      command,
      (environment?: TransactionEnvironment) =>
        handler.handle(command, environment),
    );

    return pipeline();
  }
}

// eslint-disable-next-line prettier/prettier
class CommandHandlerExcepcion extends Exception { }
