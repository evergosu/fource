import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';
import type { CommandHandler } from 'server/library/ddd/application/cqrs/command/command-handler';
import type { Task } from 'server/library/ddd/primitives';

import type { BanStoryCommand } from './ban-story-command';
import type { BanStoryFailure } from './ban-story-failure';
import type { BanStoryUseCase } from './ban-story-usecase';

/**
 * ---
 * Command handler responsible for executing {@link BanStoryCommand}.
 *
 * The handler acts as the bridge between:
 *
 * - the **command bus**
 * - the **application use case**
 * ---
 * Responsibilities:
 *
 * - receive the command dispatched by the command bus
 * - provide the execution environment
 * - delegate business logic to the use case
 * ---
 * Handlers must remain thin and should **not contain domain logic**.
 */
export class BanStoryCommandHandler implements CommandHandler<BanStoryCommand, void, BanStoryFailure> {
  /**
   * ---
   * Constructs a new BanStoryCommandHandler.
   * ---
   * @param useCase - Application use case implementing story creation logic.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly useCase: BanStoryUseCase) { }

  /**
   * ---
   * Executes the command using the provided transactional environment.
   *
   * The environment is provided by the UnitOfWork middleware and contains:
   *
   * - repository provider bound to the current transaction
   * - aggregate tracker used for domain event collection
   * ---
   * @param command - Command containing the payload for story creation.
   * @param environment - Transaction-scoped execution environment.
   */
  handle(command: BanStoryCommand, environment: TransactionEnvironment): Task<void, BanStoryFailure> {
    return this.useCase.execute(command, environment);
  }
}
