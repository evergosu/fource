/* eslint-disable prettier/prettier */
import type { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import type { DomainCreate } from 'server/library/ddd/domain/repository/capabilities/create';
import type { DomainDelete } from 'server/library/ddd/domain/repository/capabilities/delete';
import type { AggregateTracker } from 'server/database/orm/unit-of-work/aggregate-tracker';

import {
  AggregateAlreadyExistsFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { guardEmptyArray } from 'server/library/ddd/domain/invariants/array/empty-array';
import { identity } from 'server/library/ddd/types/identity';
import { Task } from 'server/library/ddd/primitives';

import {
  type BanVoteFailureMap,
  BanVoteErrorPolicy,
} from './ban-vote-error-policy';
import { BanVoteSerializer } from './ban-vote-serializers';
import { BanVoteDatabase } from './ban-vote-database';
import { type BanVote } from './ban-vote';

interface BanVoteRepositoryEnvironment {
  provider: TransactionalDatabaseProvider;
  tracker: AggregateTracker;
}

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class BanVoteRepository
  implements
  DomainDelete<BanVote<'persisted'>, BanVoteFailureMap>,
  DomainCreate<typeof BanVoteSerializer.insert, BanVoteFailureMap> {
  readonly errorPolicy = BanVoteErrorPolicy;

  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   * @param tracker - event tracker for modified aggregates.
   */
  private constructor(
    private readonly persistence: BanVoteDatabase,
    private readonly tracker: AggregateTracker,
  ) { }

  /**
   * ---
   * Factory method for safely creating an `BanVoteRepository` instance.
   * ---
   * @param environment - environment in which instance should be created.
   */
  static new(environment: BanVoteRepositoryEnvironment) {
    return new BanVoteRepository(
      environment.provider.get(BanVoteDatabase),
      environment.tracker,
    );
  }

  /** @inheritdoc */
  public delete(
    story: BanVote<'persisted'>,
  ): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure> {
    this.tracker.track(story);

    return this.persistence
      .delete(story.id.toString())
      .mapError(this.errorPolicy.translate('delete'))
      .validate(guardEmptyArray(BanVoteRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(
          BanVoteRepository.name,
          story.id,
        ),
        _: identity,
      })
      .map(() => void 0);
  }

  /** @inheritdoc */
  public create(
    story: BanVote<'new'>,
  ): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure> {
    this.tracker.track(story);

    return BanVoteSerializer.insert
      .serialize(story)
      .toTask()
      .flatMap(s => this.persistence.create(s))
      .mapError(this.errorPolicy.translate('create'));
  }

  /**
   * ---
   * Counts how many ban votes exist for a given story.
   * ---
   * @param id - Identifier of the story whose votes should be counted.
   * @returns number of votes associated with the story.
   */
  public countByStoryId(
    id: BanVote<'persisted'>['storyId'],
  ): Task<number, AggregatePersistenceFailure> {
    return this.persistence
      .countById(id.toString())
      .mapError(this.errorPolicy.translate('countByStoryId'));
  }
}
