/* eslint-disable prettier/prettier */
import {
  type DomainFailure,
  domainFailure,
} from 'server/library/ddd/domain/issues/failure';
import {
  UniqueIdentifier,
  AggregateRoot,
  Result,
} from 'server/library/ddd/primitives';

import type { Story } from '../story/story';

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
  voterId: string;
  storyId: string;
  id: string;
}

/**
 * ---
 * Properties of a brand new in-memory `BanVote`.
 */
interface Properties {
  storyId: Story<'persisted'>['id'];
  voterId: UniqueIdentifier;
}

/**
 * ---
 * Represents a short-lived user-generated vote in the platform.
 * ---
 * `Stories` include metadata and content and are the root of emoji reactions,
 * Fource actions, and moderation signals.
 */
export class BanVote extends AggregateRoot<Properties> {
  /**
   * ---
   * Private constructor. Use `.create()` factory method instead.
   * ---
   * @param properties An inner properties of an aggregate.
   * @param identifier An optional `UniqueIdentifier` of an `AggregateRoot` to rehydrate from.
   */
  private constructor(properties: Properties, identifier?: UniqueIdentifier) {
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
      new BanVote({
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
          new BanVote(
            {
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
  public register(): BanVoteRegisteredEvent {
    return new BanVoteRegisteredEvent(this.id, {
      storyId: this.properties.storyId,
      voterId: this.properties.voterId,
    });
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
