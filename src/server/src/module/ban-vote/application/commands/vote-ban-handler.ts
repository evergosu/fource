import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';
import type { CommandHandler } from 'server/library/ddd/application/cqrs/command/command-handler';
import type { Task } from 'server/library/ddd/primitives';

import type { VoteBanCommand } from './vote-ban-command';
import type { VoteBanFailure } from './vote-ban-failure';
import type { VoteBanUseCase } from './vote-ban-usecase';

/**
 * ---
 * Command handler responsible for executing {@link VoteBanCommand}.
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
export class VoteBanCommandHandler implements CommandHandler<VoteBanCommand, void, VoteBanFailure> {
  /**
   * ---
   * Constructs a new VoteBanCommandHandler.
   * ---
   * @param useCase - Application use case implementing story creation logic.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly useCase: VoteBanUseCase) { }

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
  handle(command: VoteBanCommand, environment: TransactionEnvironment): Task<void, VoteBanFailure> {
    return this.useCase.execute(command, environment);
  }
}
