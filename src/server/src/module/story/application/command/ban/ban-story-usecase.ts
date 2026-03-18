import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';

import {
  UniqueIdentifier,
  CommandUseCase,
  type Task,
} from 'server/library/ddd/primitives';
import { StoryRepository } from 'server/module/story/infrastructure/repository/story-repository';

import { BanStoryFailure } from './ban-story-failure';

/**
 * ---
 * Input required to ban a story.
 *
 * This interface represents the **application boundary contract**
 * for the use case.
 */
export interface BanStoryInput {
  /**
   * ---
   * Identifier of the story to ban.
   */
  storyId: string;
}

/**
 * ---
 * Application use case responsible for banning a Story aggregate.
 * ---
 * Responsibilities:
 *
 * - construct the Story aggregate
 * - persist the aggregate through the repository
 * - translate domain/infrastructure failures into application failures
 * ---
 * The use case **must not contain infrastructure logic**.
 * Persistence concerns are delegated to the repository resolved
 * from the provided execution environment.
 */
export class BanStoryUseCase extends CommandUseCase<
  BanStoryInput,
  void,
  BanStoryFailure
> {
  /**
   * ---
   * Executes the story ban workflow.
   * ---
   * Execution steps:
   *
   * 1. Construct the Story aggregate using domain factory.
   * 2. Persist the aggregate via repository.
   * ---
   * Domain events produced by the aggregate will be tracked automatically
   * by the AggregateTracker inside the transaction environment.
   * ---
   * @param input - Input payload required to Ban the story.
   * @param environment - Transaction-scoped execution environment.
   */
  execute(
    input: BanStoryInput,
    environment: TransactionEnvironment,
  ): Task<void, BanStoryFailure> {
    const repository = StoryRepository.new(environment);

    return UniqueIdentifier.create(input.storyId)
      .toTask()
      .flatMap(id => repository.getById(id))
      .flatMap(story => {
        story.ban();
        return repository.updateWithLock(story);
      })
      .map(() => void 0)
      .matchFailure({
        _: BanStoryFailure(BanStoryUseCase.name),
      });
  }
}
