import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';

import { CommandUseCase, type Task } from 'server/library/ddd/primitives';

import { CreateStoryFailure } from './create-story-failure';
import { StoryRepository } from '../../story-repository';
import { Story } from '../../story';

/**
 * ---
 * Input required to create a story.
 *
 * This interface represents the **application boundary contract**
 * for the use case.
 */
export interface CreateStoryInput {
  /**
   * ---
   * Identifier of the author creating the story.
   */
  authorId: string;

  /**
   * ---
   * Raw story title.
   */
  title: string;

  /**
   * ---
   * Raw story body content.
   */
  body: string;
}

/**
 * ---
 * Application use case responsible for creating a new Story aggregate.
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
export class CreateStoryUseCase extends CommandUseCase<
  CreateStoryInput,
  string,
  CreateStoryFailure
> {
  /**
   * ---
   * Executes the story creation workflow.
   * ---
   * Execution steps:
   *
   * 1. Construct the Story aggregate using domain factory.
   * 2. Persist the aggregate via repository.
   * 3. Return the identifier of the created story.
   * ---
   * Domain events produced by the aggregate will be tracked automatically
   * by the AggregateTracker inside the transaction environment.
   * ---
   * @param input - Input payload required to create the story.
   * @param environment - Transaction-scoped execution environment.
   */
  execute(
    input: CreateStoryInput,
    environment: TransactionEnvironment,
  ): Task<string, CreateStoryFailure> {
    return Story.create({
      authorId: input.authorId,
      title: input.title,
      body: input.body,
    })
      .toTask()
      .flatMap(story =>
        StoryRepository.new(environment)
          .create(story)
          .map(() => story.id.toString()),
      )
      .matchFailure({
        _: CreateStoryFailure(CreateStoryUseCase.name),
      });
  }
}
