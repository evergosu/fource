/* eslint-disable prettier/prettier */
import type { DomainUpdateWithLock } from 'server/library/ddd/domain/repository/capabilities/update-with-lock';
import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';
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
import { DomainRepository } from 'server/library/ddd/domain/repository/domain-repository';
import { identity } from 'server/library/ddd/types/identity';

import type { StoryDatabase } from './story-database';

import {
  StoryInsertSerializer,
  StoryUpdateSerializer,
} from './story-serializers';
import { StoryRehydrator } from './story-rehydrator';
import { StoryFailure, type Story } from './story';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class StoryRepository
  extends DomainRepository<StoryDatabase>
  implements
  DomainGetAll<StoryRehydrator>,
  DomainGetById<StoryRehydrator>,
  DomainDelete<Story<'persisted'>>,
  DomainCreate<StoryInsertSerializer>,
  DomainGetBySpecification<StoryRehydrator>,
  DomainUpdateWithLock<StoryUpdateSerializer> {
  private translateInfrastructureFailureUpdate = (
    error: InfrastructureFailures,
  ) => {
    switch (error._tag) {
      case 'ForeignKeyViolationFailure': {
        return AggregateNotFoundFailure(StoryRepository.name)(error);
      }

      case 'UniqueViolationFailure': {
        return AggregateAlreadyExistsFailure(StoryRepository.name)(error);
      }

      default: {
        return AggregatePersistenceFailure(StoryRepository.name)(error);
      }
    }
  };

  private translateInfrastructureFailureCreate = (
    error: InfrastructureFailures,
  ) =>
    error._tag === 'UniqueViolationFailure'
      ? AggregateAlreadyExistsFailure(StoryRepository.name)(error)
      : AggregatePersistenceFailure(StoryRepository.name)(error);

  private translateInfrastructureFailureSelect = (
    error: InfrastructureFailures,
  ) =>
    error._tag === 'ForeignKeyViolationFailure'
      ? AggregateNotFoundFailure(StoryRepository.name)(error)
      : AggregatePersistenceFailure(StoryRepository.name)(error);
  public readonly insertSerializer = new StoryInsertSerializer();
  public readonly updateSerializer = new StoryUpdateSerializer();
  public readonly rehydrator = new StoryRehydrator();

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
      .mapError(this.translateInfrastructureFailureSelect)
      .flatMap(stories => this.rehydrator.rehydrateList(stories).toTask())
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
      .mapError(this.translateInfrastructureFailureSelect)
      .refine(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name, id),
        _: identity,
      })
      .map(ss => ss[0])
      .flatMap(s => this.rehydrator.rehydrate(s).toTask());
  }

  /** @inheritdoc */
  public delete(
    id: UniqueIdentifier,
  ): Task<void, AggregatePersistenceFailure | AggregateNotFoundFailure> {
    return this.persistence
      .delete(id.toString())
      .mapError(this.translateInfrastructureFailureSelect)
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
    | AggregateAlreadyExistsFailure
    | AggregatePersistenceFailure
    | AggregateConcurrencyFailure
    | AggregateNotFoundFailure
  > {
    return this.updateSerializer
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.updateWithLock(row))
      .mapError(this.translateInfrastructureFailureUpdate)
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
      .mapError(this.translateInfrastructureFailureSelect)
      .validate(guardEmptyArray(StoryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryRepository.name),
        _: identity,
      })
      .flatMap(stories => this.rehydrator.rehydrateList(stories).toTask())
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
    return this.insertSerializer
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.create(row))
      .mapError(this.translateInfrastructureFailureCreate);
  }
}
