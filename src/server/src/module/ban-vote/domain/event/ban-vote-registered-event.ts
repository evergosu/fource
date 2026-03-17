/* eslint-disable sonarjs/no-nested-functions */
/* eslint-disable prettier/prettier */
import type { Story } from 'server/module/story/domain/story';

import {
  UniqueIdentifier,
  DomainEvent,
  Result,
} from 'server/library/ddd/primitives';

import { BanVoteCreatedAt } from '../value-object/ban-vote-created-at';

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
  private static createPersisted =
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

  /** @inheritdoc */
  constructor(
    aggregateId: UniqueIdentifier,
    payload: Payload,
    occurredAt?: Date,
    id?: UniqueIdentifier,
  ) {
    super(aggregateId, payload, 'BanVoteRegisteredEvent', occurredAt, id);
  }

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
    return Result.ok(this.createPersisted)
      .ap(UniqueIdentifier.create(properties.aggregateId))
      .ap(UniqueIdentifier.create(properties.payload.storyId))
      .ap(UniqueIdentifier.create(properties.payload.voterId))
      .ap(BanVoteCreatedAt.fromDate(properties.payload.createdAt))
      .ap(Result.ok(new Date(properties.occurredAt)))
      .ap(UniqueIdentifier.create(properties.id));
  }
}
