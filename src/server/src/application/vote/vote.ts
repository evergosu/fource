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

import { VoteRegisteredEvent } from './events/vote-registered-event';

/**
 * ---
 * Raw properties required to create a `Vote`.
 */
interface CreateVoteProperties {
  voterId: string;
  storyId: string;
}

/**
 * ---
 * Raw properties required to rehydrate a `Vote`.
 */
interface RehydrateVoteProperties {
  voterId: string;
  storyId: string;
  id: string;
}

/**
 * ---
 * Properties of a brand new in-memory `Vote`.
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
export class Vote extends AggregateRoot<Properties> {
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
   * @returns `Result` wrapping new `Vote`.
   */
  private static readonly createNew =
    (storyId: Story<'persisted'>['id']) => (voterId: UniqueIdentifier) =>
      new Vote({
        storyId,
        voterId,
      });

  /**
   * ---
   * Factory method to create a persisted vote.
   * ---
   * @param id - vote identifier
   * @returns `Result` wrapping persisted `Vote`.
   */
  private static readonly createPersisted =
    (id: UniqueIdentifier) =>
      (storyId: Story<'persisted'>['id']) =>
        (voterId: UniqueIdentifier) =>
          new Vote(
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
   * @param properties - A raw object to reconstruct `Vote` from.
   * @returns `Result` wrapping the `Vote` rehydrated from a raw input.
   */
  public static rehydrate(properties: RehydrateVoteProperties) {
    return Result.ok(this.createPersisted)
      .ap(UniqueIdentifier.create(properties.id))
      .ap(UniqueIdentifier.create(properties.storyId))
      .ap(UniqueIdentifier.create(properties.voterId))
      .matchFailure({ _: VoteFailure(this.name) });
  }

  /**
   * ---
   * Factory method to create a new vote.
   * ---
   * @param properties - A raw object to construct `Vote` from.
   * @returns `Result` wrapping new `Vote`.
   */
  public static create(properties: CreateVoteProperties) {
    return Result.ok(this.createNew)
      .ap(UniqueIdentifier.create(properties.storyId))
      .ap(UniqueIdentifier.create(properties.voterId))
      .matchFailure({ _: VoteFailure(this.name) });
  }

  /**
   * ---
   * Registers a vote and produces a domain event.
   */
  public register(): VoteRegisteredEvent {
    return new VoteRegisteredEvent(this.id, {
      storyId: this.properties.storyId,
      voterId: this.properties.voterId,
    });
  }
}

export type VoteFailure = {
  readonly cause: DomainFailure;
  readonly _tag: 'VoteFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const VoteFailure =
  (name: string) =>
    (cause: DomainFailure): VoteFailure =>
      domainFailure({
        _tag: 'VoteFailure',
        cause,
        name,
      });
