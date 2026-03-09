import type { Story } from 'server/application/story/story';

import {
  UniqueIdentifier,
  type DomainEvent,
} from 'server/library/ddd/primitives';

/**
 * ---
 * Event emitted when a vote for banning a story is registered.
 */
export class VoteRegisteredEvent implements DomainEvent {
  /**
   * ---
   * Globally `unique identifier` for the event.
   */
  public readonly id: UniqueIdentifier = UniqueIdentifier.create().value;
  /**
   * ---
   * The concrete type of the domain event.
   */
  public readonly type = 'VoteRegisteredEvent';
  /**
   * ---
   * Constructs new `VoteRegisteredEvent` instance.
   * ---
   * @param aggregateId - The `unique identifier` of an aggregate dispatched the event.
   * @param payload - The usefull payload carried by the domain event.
   * @param payload.storyId - Identifier of the story receiving the vote.
   * @param payload.voterId - Identifier of the user who cast the vote.
   */
  constructor(
    public readonly aggregateId: UniqueIdentifier,
    public readonly payload: {
      storyId: Story<'persisted' | 'new'>['id'];
      voterId: UniqueIdentifier;
    },
    // eslint-disable-next-line prettier/prettier
  ) { }
}
