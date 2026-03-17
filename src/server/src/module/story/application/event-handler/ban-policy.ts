/* eslint-disable prettier/prettier */
import type { BanVoteQueryRepository } from 'server/module/ban-vote/infrastructure/ban-vote-query-repository';
import type { BanVoteRegisteredEvent } from 'server/module/ban-vote/domain/event/ban-vote-registered-event';
import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { Failure } from 'server/library/ddd/domain/issues/failure';

import { Task } from 'server/library/ddd/primitives';

import { BanStoryCommand } from '../command/ban/ban-story-command';

/**
 * ---
 * Domain policy responsible for banning a story once the vote threshold is reached.
 */
export class StoryBanPolicy {
  /**
   * ---
   * Constructs new `StoryBanPolicy` instance.
   * ---
   * @param repository - Repository used to count votes.
   * @param commandBus - Bus used to dispatch ban commands.
   * @param threshold - Amount of votes required to ban a story.
   */
  constructor(
    private readonly repository: BanVoteQueryRepository,
    private readonly commandBus: InMemoryCommandBus,
    private readonly threshold: number,
  ) { }

  /**
   * ---
   * Handles vote registered events.
   * ---
   * @param event - Event emitted after a vote is stored.
   */
  handle(event: BanVoteRegisteredEvent): Task<void, Failure> {
    return this.repository.countById(event.payload.storyId).flatMap(count => {
      if (count < this.threshold) {
        return Task.ok();
      }

      return this.commandBus.dispatch(
        new BanStoryCommand(event.payload.storyId.toString()),
      );
    });
  }
}
