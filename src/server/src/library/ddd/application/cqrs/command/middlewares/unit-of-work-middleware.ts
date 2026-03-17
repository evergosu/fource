/* eslint-disable prettier/prettier */
import type { DrizzleUnitOfWork } from 'server/infrastructure/orm/unit-of-work/drizzle-unit-of-work';
import type { Task } from 'server/library/ddd/primitives';

import type {
  TransactionEnvironment,
  UnitOfWorkFailure,
} from '../../../unit-of-work/unit-of-work';
import type { CommandMiddleware } from '../command-middleware';
import type { Command } from '../command';

/**
 * ---
 * Middleware for wrapping command execution in a transactional Unit of Work.
 * ---
 * Responsibilities:
 * - Executes the command handler within a database transaction.
 * - Collects domain events emitted by aggregates during command execution.
 * - Persists events to the outbox if present.
 * - Rolls back transaction if either the command or outbox persistence fails.
 * ---
 * Usage:
 * This middleware should be applied to a CommandBus pipeline so that all commands
 * dispatched through the bus automatically run inside a unit-of-work context.
 * ---
 * @template F - Type of failure the middleware may produce. In this case, always
 *               extends UnitOfWorkFailure when transactional errors occur.
 */
export class UnitOfWorkMiddleware
  implements CommandMiddleware<UnitOfWorkFailure> {
  /**
   * ---
   * Constructs a UnitOfWorkMiddleware.
   * ---
   * @param uow - Instance of `DrizzleUnitOfWork` which provides transactional
   *              execution and event tracking capabilities.
   */
  constructor(private readonly uow: DrizzleUnitOfWork) { }

  /**
   * ---
   * Executes the given command within the Unit of Work context.
   * ---
   * The middleware intercepts the command execution, runs it inside a transaction,
   * collects any domain events via the `AggregateTracker`, and persists events
   * to the outbox. If the command or outbox persistence fails, the transaction
   * is rolled back and a `UnitOfWorkFailure` is returned in the Task's error channel.
   * ---
   * @template O - Type of the command output value.
   * @template F - Type of the command-specific failure returned by the handler.
   * @param _command - The command being executed. Typically used for logging or
   *                   auditing; not used directly here.
   * @param next - A function returning a `Task<O, F>` that represents the next
   *               stage in the middleware pipeline (typically the command handler).
   * @returns A `Task<O, UnitOfWorkFailure | F>` that resolves to the output of
   *          the command handler or fails with either a `UnitOfWorkFailure`
   *          (transaction or outbox failure) or the original handler failure `F`.
   */
  execute<O, F>(
    _command: Command<unknown, unknown>,
    next: (environment: TransactionEnvironment) => Task<O, F>,
  ): Task<O, UnitOfWorkFailure | F> {
    return this.uow.execute(environment => next(environment));
  }
}
