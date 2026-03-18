import type { TransactionEnvironment } from 'server/library/ddd/application/unit-of-work/unit-of-work';

import { CommandUseCase, type Task } from 'server/library/ddd/primitives';

import { BanVoteRepository } from '../../infrastructure/repository/ban-vote-repository';
import { VoteBanFailure } from './vote-ban-failure';
import { BanVote } from '../../domain/ban-vote';

/**
 * ---
 * Input required to vote for ban a story.
 *
 * This interface represents the **application boundary contract**
 * for the use case.
 */
export interface VoteBanInput {
  /**
   * ---
   * Identifier of the story being voted for ban.
   */
  storyId: string;

  /**
   * ---
   * Identifier of the user who voting the story.
   */
  voterId: string;
}

/**
 * ---
 * Application use case responsible for ban voting.
 * ---
 * Responsibilities:
 *
 * - construct the BanVote aggregate
 * - persist the aggregate through the repository
 * - translate domain/infrastructure failures into application failures
 * ---
 * The use case **must not contain infrastructure logic**.
 * Persistence concerns are delegated to the repository resolved
 * from the provided execution environment.
 */
export class VoteBanUseCase extends CommandUseCase<
  VoteBanInput,
  void,
  VoteBanFailure
> {
  /**
   * ---
   * Executes the story creation workflow.
   * ---
   * Execution steps:
   *
   * 1. Construct the BanVote aggregate using domain factory.
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
    input: VoteBanInput,
    environment: TransactionEnvironment,
  ): Task<void, VoteBanFailure> {
    return BanVote.create({
      storyId: input.storyId,
      voterId: input.voterId,
    })
      .toTask()
      .flatMap(vote => BanVoteRepository.new(environment).create(vote))
      .matchFailure({ _: VoteBanFailure(VoteBanUseCase.name) });
  }
}
