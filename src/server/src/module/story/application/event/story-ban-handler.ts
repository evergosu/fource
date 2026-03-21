import type { BanVoteQueryRepository } from 'server/module/ban-vote/infrastructure/repository/ban-vote-query-repository';
import type { BanVoteRegisteredEvent } from 'server/module/ban-vote/domain/event/ban-vote-registered-event';
import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { EventHandler } from 'server/library/ddd/domain/events/domain-event-handler';
import type { Failure } from 'server/library/ddd/domain/issues/failure';

import { Task } from 'server/library/ddd/primitives';

import type { StoryBanPolicy } from '../../domain/policy/story-ban-policy';

import { BanStoryCommand } from '../command/ban/ban-story-command';

/**
 * ---
 * Application event handler responsible for story bans.
 * ---
 * Responsibilities:
 * - load vote count
 * - evaluate domain policy
 * - dispatch ban command
 */
export class StoryBanHandler implements EventHandler<BanVoteRegisteredEvent> {
  /**
   * ---
   * Constructs new `StoryBanSaga` instance.
   * ---
   * @param repository - Repository used to count votes.
   * @param commandBus - Bus used to dispatch ban commands.
   * @param policy - Domain policy evaluated to ban a story.
   */
  constructor(
    private readonly repository: BanVoteQueryRepository,
    private readonly commandBus: InMemoryCommandBus,
    private readonly policy: StoryBanPolicy,
    // eslint-disable-next-line prettier/prettier
  ) { }

  /**
   * ---
   * Handles ban triggering events.
   * ---
   * @param event - Event emitted after a vote is stored.
   */
  handle(event: BanVoteRegisteredEvent): Task<void, Failure> {
    return this.repository.countById(event.payload.storyId).flatMap(count => {
      if (!this.policy.shouldBan(count)) {
        return Task.ok();
      }

      return this.commandBus.dispatch(new BanStoryCommand(event.payload.storyId.toString()));
    });
  }
}
