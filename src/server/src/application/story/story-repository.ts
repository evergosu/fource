/* eslint-disable prettier/prettier */
import type { DomainUpdateWithLock } from 'server/library/ddd/domain/repository/capabilities/update-with-lock';
import type { DomainGetById } from 'server/library/ddd/domain/repository/capabilities/get-by-id';
import type { DomainGetAll } from 'server/library/ddd/domain/repository/capabilities/get-all';
import type { DomainCreate } from 'server/library/ddd/domain/repository/capabilities/create';
import type { DomainDelete } from 'server/library/ddd/domain/repository/capabilities/delete';

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
   */ constructor(private readonly persistence: StoryDatabase) { }

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
      .map(ss => ss[0])
      .flatMap(s => StoryRehydrator.rehydrate(s).toTask());
  }

  /** @inheritdoc */
  public delete(
    id: UniqueIdentifier,
  ): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure> {
    return this.persistence
      .delete(id.toString())
      .mapError(this.errorPolicy.translate('delete'))
      .validate(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name, id),
        _: identity,
      })
      .map(() => void 0);
  }

  /** @inheritdoc */
  public updateWithLock(
    domain: Story<'persisted'>,
  ): Task<
    UniqueIdentifier,
    | AggregatePersistenceFailure
    | AggregateConcurrencyFailure
    | AggregateNotFoundFailure
  > {
    return StorySerializer.update
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.updateWithLock(row))
      .mapError(this.errorPolicy.translate('updateWithLock'))
      .refine(guardEmptyArray(StoryRepository.name))
      .flatMap(value => UniqueIdentifier.create(value[0]).toTask())
      .matchFailure({
        EmptyArrayFailure: AggregateConcurrencyFailure(
          StoryRepository.name,
          domain.id,
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
    domain: Story<'new'>,
  ): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure> {
    return StorySerializer.insert
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.create(row))
      .mapError(this.errorPolicy.translate('create'));
  }
}
