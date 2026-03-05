/* eslint-disable prettier/prettier */
import type { DomainUpdateWithLock } from 'server/library/ddd/domain/repository/capabilities/update-with-lock';
import type { DomainGetById } from 'server/library/ddd/domain/repository/capabilities/get-by-id';
import type { DomainGetAll } from 'server/library/ddd/domain/repository/capabilities/get-all';
import type { DomainCreate } from 'server/library/ddd/domain/repository/capabilities/create';
import type { DomainDelete } from 'server/library/ddd/domain/repository/capabilities/delete';
import type { AggregateTracker } from 'server/database/orm/unit-of-work/aggregate-tracker';

import {
  AggregateSpecificationFailure,
  AggregateAlreadyExistsFailure,
  AggregateConcurrencyFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { type DomainGetBySpecification } from 'server/library/ddd/domain/repository/capabilities/get-by-specification';
import {
  type NonEmptyArray,
  guardEmptyArray,
} from 'server/library/ddd/domain/invariants/array/empty-array';
import {
  UniqueIdentifier,
  Specification,
  Task,
} from 'server/library/ddd/primitives';
import { identity } from 'server/library/ddd/types/identity';

import type { StoryDatabase } from './story-database';

import { type StoryFailureMap, StoryErrorPolicy } from './story-error-policy';
import { StorySerializer } from './story-serializers';
import { StoryRehydrator } from './story-rehydrator';
import { StoryFailure, type Story } from './story';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class StoryRepository
  implements
  DomainGetAll<typeof StoryRehydrator, StoryFailureMap>,
  DomainGetById<typeof StoryRehydrator, StoryFailureMap>,
  DomainDelete<Story<'persisted'>, StoryFailureMap>,
  DomainCreate<typeof StorySerializer.insert, StoryFailureMap>,
  DomainGetBySpecification<typeof StoryRehydrator, StoryFailureMap>,
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
   * ---
   * @param persistence - persistence source of actions.
   * @param tracker - event tracker for modified aggregates.
   */
  static new(persistence: StoryDatabase, tracker: AggregateTracker) {
    return new StoryRepository(persistence, tracker);
  }

  /** @inheritdoc */
  public getBySpecification(
    specification: Specification<Story<'persisted'>>,
  ): Task<
    NonEmptyArray<Story<'persisted'>>,
    | AggregateSpecificationFailure
    | AggregatePersistenceFailure
    | AggregateNotFoundFailure
    | StoryFailure
  > {
    return this.persistence
      .getAll()
      .mapError(this.errorPolicy.translate('getBySpecification'))
      .flatMap(stories => StoryRehydrator.rehydrateList(stories).toTask())
      .map(ss => ss.filter(s => specification.isSatisfiedBy(s)))
      .refine(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateSpecificationFailure(
          StoryRepository.name,
          specification,
        ),
        _: identity,
      });
  }

  /** @inheritdoc */
  public getById(
    id: UniqueIdentifier,
  ): Task<
    Story<'persisted'>,
    AggregatePersistenceFailure | AggregateNotFoundFailure | StoryFailure
  > {
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
  public delete(
    story: Story<'persisted'>,
  ): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure> {
    this.tracker.track(story);

    return this.persistence
      .delete(story.id.toString())
      .mapError(this.errorPolicy.translate('delete'))
      .validate(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(
          StoryRepository.name,
          story.id,
        ),
        _: identity,
      })
      .map(() => void 0);
  }

  /** @inheritdoc */
  public updateWithLock(
    story: Story<'persisted'>,
  ): Task<
    UniqueIdentifier,
    | AggregatePersistenceFailure
    | AggregateConcurrencyFailure
    | AggregateNotFoundFailure
  > {
    this.tracker.track(story);

    return StorySerializer.update
      .serialize(story)
      .toTask()
      .flatMap(s => this.persistence.updateWithLock(s))
      .mapError(this.errorPolicy.translate('updateWithLock'))
      .refine(guardEmptyArray(StoryRepository.name))
      .flatMap(value => UniqueIdentifier.create(value[0]).toTask())
      .matchFailure({
        EmptyArrayFailure: AggregateConcurrencyFailure(
          StoryRepository.name,
          story.id,
        ),
        UniqueIdentifierFailure: AggregatePersistenceFailure(
          StoryRepository.name,
        ),
        _: identity,
      });
  }

  /** @inheritdoc */
  public getAll(): Task<
    NonEmptyArray<Story<'persisted'>>,
    AggregatePersistenceFailure | AggregateNotFoundFailure | StoryFailure
  > {
    return this.persistence
      .getAll()
      .mapError(this.errorPolicy.translate('getAll'))
      .validate(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name),
        _: identity,
      })
      .flatMap(stories => StoryRehydrator.rehydrateList(stories).toTask())
      .refine(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: StoryFailure(StoryRepository.name),
        _: identity,
      });
  }

  /** @inheritdoc */
  public create(
    story: Story<'new'>,
  ): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure> {
    this.tracker.track(story);

    return StorySerializer.insert
      .serialize(story)
      .toTask()
      .flatMap(s => this.persistence.create(s))
      .mapError(this.errorPolicy.translate('create'));
  }
}
