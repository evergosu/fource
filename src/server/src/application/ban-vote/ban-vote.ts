/* eslint-disable prettier/prettier */
import type { Story } from 'server/module/story/domain/story';

import {
  type DomainFailure,
  domainFailure,
} from 'server/library/ddd/domain/issues/failure';
import {
  UniqueIdentifier,
  AggregateRoot,
  Result,
} from 'server/library/ddd/primitives';

import type { BanVoteCreatedAt } from './ban-vote-created-at';

import { BanVoteRegisteredEvent } from './events/ban-vote-registered-event';

/**
 * ---
 * Raw properties required to create a `BanVote`.
 */
interface CreateBanVoteProperties {
  voterId: string;
  storyId: string;
}

/**
 * ---
 * Raw properties required to rehydrate a `BanVote`.
 */
interface RehydrateBanVoteProperties {
  createdAt: Date;
  voterId: string;
  storyId: string;
  id: string;
}

/**
 * ---
 * Properties of a brand new in-memory `BanVote`.
 */
interface NewBanVoteProperties {
  storyId: Story<'persisted'>['id'];
  voterId: UniqueIdentifier;
}

/**
 * ---
 * Properties of a persisted `BanVote`.
 */
interface PersistedBanVoteProperties extends NewBanVoteProperties {
  createdAt: BanVoteCreatedAt;
}

type BanVoteState = 'persisted' | 'new';

/**
 * ---
 * Lifecycle properties of a `BanVote`.
 */
type Properties<State extends BanVoteState> = State extends 'new'
  ? NewBanVoteProperties
  : PersistedBanVoteProperties;

/**
 * ---
 * Represents a ban vote in the platform.
 */
export class BanVote<State extends BanVoteState> extends AggregateRoot<
  Properties<State>
> {
  /**
   * ---
   * Private constructor. Use `.create()` factory method instead.
   * ---
   * @param properties An inner properties of an aggregate.
   * @param identifier An optional `UniqueIdentifier` of an `AggregateRoot` to rehydrate from.
   */
  private constructor(
    properties: Properties<State>,
    identifier?: UniqueIdentifier,
  ) {
    super(properties, identifier);
  }

  /**
   * ---
   * Factory method to create a new vote.
   * ---
   * @param storyId - identifier of story under vote
   * @returns `Result` wrapping new `BanVote`.
   */
  private static readonly createNew =
    (storyId: Story<'persisted'>['id']) => (voterId: UniqueIdentifier) =>
      new BanVote<'new'>({
        storyId,
        voterId,
      });

  /**
   * ---
   * Factory method to create a persisted vote.
   * ---
   * @param id - vote identifier
   * @returns `Result` wrapping persisted `BanVote`.
   */
  private static readonly createPersisted =
    (id: UniqueIdentifier) =>
      (storyId: Story<'persisted'>['id']) =>
        (voterId: UniqueIdentifier) =>
          (createdAt: BanVoteCreatedAt) =>
            new BanVote<'persisted'>(
              {
                createdAt,
                storyId,
                voterId,
              },
              id,
            );

  /**
   * ---
   * Factory method to create a new vote.
   * ---
   * @param properties - A raw object to reconstruct `BanVote` from.
   * @returns `Result` wrapping the `BanVote` rehydrated from a raw input.
   */
  public static rehydrate(properties: RehydrateBanVoteProperties) {
    return Result.ok(this.createPersisted)
      .ap(UniqueIdentifier.create(properties.id))
      .ap(UniqueIdentifier.create(properties.storyId))
      .ap(UniqueIdentifier.create(properties.voterId))
      .matchFailure({ _: BanVoteFailure(this.name) });
  }

  /**
   * ---
   * Factory method to create a new vote.
   * ---
   * @param properties - A raw object to construct `BanVote` from.
   * @returns `Result` wrapping new `BanVote`.
   */
  public static create(properties: CreateBanVoteProperties) {
    return Result.ok(this.createNew)
      .ap(UniqueIdentifier.create(properties.storyId))
      .ap(UniqueIdentifier.create(properties.voterId))
      .matchFailure({ _: BanVoteFailure(this.name) });
  }

  /**
   * ---
   * Registers a vote and produces a domain event.
   */
  public register(this: BanVote<'persisted'>): BanVoteRegisteredEvent {
    return new BanVoteRegisteredEvent(this.id, {
      createdAt: this.properties.createdAt,
      storyId: this.properties.storyId,
      voterId: this.properties.voterId,
    });
  }

  /**
   * ---
   * An `Identifier` of the `Story` which casted the vote on.
   */
  get storyId(): Story<'persisted'>['id'] {
    return this.properties.storyId;
  }

  /**
   * ---
   * An `Identifier` of the `User` who casted the vote.
   */
  get voterId(): UniqueIdentifier {
    return this.properties.voterId;
  }

  /**
   * ---
   * `Date` when the `BanVote` was created.
   */
  public createdAt(this: BanVote<'persisted'>): BanVoteCreatedAt {
    return this.properties.createdAt;
  }
}

export type BanVoteFailure = {
  readonly _tag: 'BanVoteFailure';
  readonly cause: DomainFailure;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const BanVoteFailure =
  (name: string) =>
    (cause: DomainFailure): BanVoteFailure =>
      domainFailure({
        _tag: 'BanVoteFailure',
        cause,
        name,
      });
