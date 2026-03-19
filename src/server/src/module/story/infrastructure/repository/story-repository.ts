/* eslint-disable prettier/prettier */
import type { DomainUpdateWithLock } from 'server/library/ddd/domain/repository/capabilities/update-with-lock';
import type { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import type { DomainGetById } from 'server/library/ddd/domain/repository/capabilities/get-by-id';
import type { AggregateTracker } from 'server/infrastructure/orm/unit-of-work/aggregate-tracker';
import type { DomainCreate } from 'server/library/ddd/domain/repository/capabilities/create';
import type { DomainDelete } from 'server/library/ddd/domain/repository/capabilities/delete';

import {
  AggregateAlreadyExistsFailure,
  AggregateConcurrencyFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { guardEmptyArray } from 'server/library/ddd/domain/invariants/array/empty-array';
import { UniqueIdentifier, Task } from 'server/library/ddd/primitives';
import { identity } from 'server/library/ddd/types/identity';

import { type StoryFailureMap, StoryErrorPolicy } from './story-error-policy';
import { StoryRehydrator } from '../rehydrator/story-rehydrator';
import { StorySerializer } from '../serializer/story-serializer';
import { StoryFailure, Story } from '../../domain/story';
import { StoryDatabase } from './story-database';

interface StoryRepositoryEnvironment {
  provider: TransactionalDatabaseProvider;
  tracker: AggregateTracker;
}

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class StoryRepository
  implements
  DomainGetById<typeof StoryRehydrator, StoryFailureMap>,
  DomainDelete<Story<'persisted'>, StoryFailureMap>,
  DomainCreate<typeof StorySerializer.insert, StoryFailureMap>,
  DomainUpdateWithLock<typeof StorySerializer.update, StoryFailureMap> {
  readonly errorPolicy = StoryErrorPolicy;

  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   * @param tracker - event tracker for modified aggregates.
   */
  private constructor(
    private readonly persistence: StoryDatabase,
    private readonly tracker: AggregateTracker,
  ) { }

  /**
   * ---
   * Factory method for safely creating an `StoryRepository` instance.
   * ---
   * @param environment - environment in which instance should be created.
   */
  static new(environment: StoryRepositoryEnvironment) {
    return new StoryRepository(environment.provider.get(StoryDatabase), environment.tracker);
  }

  /** @inheritdoc */
  public getById(
    id: UniqueIdentifier,
  ): Task<Story<'persisted'>, AggregatePersistenceFailure | AggregateNotFoundFailure | StoryFailure> {
    return this.persistence
      .getById(id.toString())
      .mapError(this.errorPolicy.translate('getById'))
      .refine(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name, id),
        _: identity,
      })
      .map(stories => stories[0])
      .flatMap(s => StoryRehydrator.rehydrate(s).toTask());
  }

  /** @inheritdoc */
  public delete(story: Story<'persisted'>): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure> {
    this.tracker.track(story);

    return this.persistence
      .delete(story.id.toString())
      .mapError(this.errorPolicy.translate('delete'))
      .validate(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name, story.id),
        _: identity,
      })
      .map(() => void 0);
  }

  /** @inheritdoc */
  public updateWithLock(
    story: Story<'persisted'>,
  ): Task<UniqueIdentifier, AggregatePersistenceFailure | AggregateConcurrencyFailure | AggregateNotFoundFailure> {
    this.tracker.track(story);

    return StorySerializer.update
      .serialize(story)
      .toTask()
      .flatMap(s => this.persistence.updateWithLock(s))
      .mapError(this.errorPolicy.translate('updateWithLock'))
      .refine(guardEmptyArray(StoryRepository.name))
      .flatMap(value => UniqueIdentifier.create(value[0]).toTask())
      .matchFailure({
        EmptyArrayFailure: AggregateConcurrencyFailure(StoryRepository.name, story.id),
        UniqueIdentifierFailure: AggregatePersistenceFailure(StoryRepository.name),
        _: identity,
      });
  }

  /** @inheritdoc */
  public create(story: Story<'new'>): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure> {
    this.tracker.track(story);

    return StorySerializer.insert
      .serialize(story)
      .toTask()
      .flatMap(s => this.persistence.create(s))
      .mapError(this.errorPolicy.translate('create'));
  }
}
