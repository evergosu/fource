/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-nested-functions */
import type { Story } from 'server/application/story/story';

import {
  UniqueIdentifier,
  DomainEvent,
  Result,
} from 'server/library/ddd/primitives';

import { BanVoteCreatedAt } from '../ban-vote-created-at';

interface Payload {
  storyId: Story<'persisted'>['id'];
  createdAt: BanVoteCreatedAt;
  voterId: UniqueIdentifier;
}

/**
 * ---
 * Event emitted when a vote for banning a story is registered.
 */
export class BanVoteRegisteredEvent extends DomainEvent<Payload> {
  private static create =
    (aggregateId: UniqueIdentifier) =>
      (storyId: UniqueIdentifier) =>
        (voterId: UniqueIdentifier) =>
          (createdAt: BanVoteCreatedAt) =>
            (occurredAt: Date) =>
              (id: UniqueIdentifier) =>
                new BanVoteRegisteredEvent(
                  aggregateId,
                  { createdAt, storyId, voterId },
                  occurredAt,
                  id,
                );

  public static override readonly type = 'BanVoteRegisteredEvent';

  /** @inheritdoc */
  public static override rehydrate(properties: {
    payload: {
      storyId: string;
      voterId: string;
      createdAt: Date;
    };
    aggregateId: string;
    occurredAt: Date;
    id: string;
  }) {
    return Result.ok(this.create)
      .ap(UniqueIdentifier.create(properties.aggregateId))
      .ap(UniqueIdentifier.create(properties.payload.storyId))
      .ap(UniqueIdentifier.create(properties.payload.voterId))
      .ap(BanVoteCreatedAt.fromDate(properties.payload.createdAt))
      .ap(Result.ok(new Date(properties.occurredAt)))
      .ap(UniqueIdentifier.create(properties.id));
  }
}
