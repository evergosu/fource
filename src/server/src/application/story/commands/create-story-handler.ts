import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';
/* eslint-disable prettier/prettier */
import type { CommandHandler } from 'server/library/ddd/application/cqrs/command/command-handler';
import type { Task } from 'server/library/ddd/primitives';

import type { CreateStoryCommand } from './create-story-command';
import type { CreateStoryUseCase } from './create-story-usecase';
import type { CreateStoryFailure } from './create-story-failure';

/**
 * ---
 * Command handler responsible for executing {@link CreateStoryCommand}.
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
export class CreateStoryCommandHandler
  implements CommandHandler<CreateStoryCommand, string, CreateStoryFailure> {
  /**
   * ---
   * Constructs a new CreateStoryCommandHandler.
   * ---
   * @param useCase - Application use case implementing story creation logic.
   */
  constructor(private readonly useCase: CreateStoryUseCase) { }

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
  handle(
    command: CreateStoryCommand,
    environment: TransactionEnvironment,
  ): Task<string, CreateStoryFailure> {
    return this.useCase.execute(command, environment);
  }
}
