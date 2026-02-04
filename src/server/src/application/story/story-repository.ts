/* eslint-disable prettier/prettier */
import type { DomainUpdateWithLock } from 'server/library/ddd/domain/repository/capabilities/update-with-lock';
import type { DomainGetById } from 'server/library/ddd/domain/repository/capabilities/get-by-id';
import type { DomainGetAll } from 'server/library/ddd/domain/repository/capabilities/get-all';
import type { DomainCreate } from 'server/library/ddd/domain/repository/capabilities/create';
import type { DomainDelete } from 'server/library/ddd/domain/repository/capabilities/delete';

import {
  NoAggregateSatisfiesSpecificationFailure,
  type StringOrNumberIdentifierFailure,
  type AggregateAlreadyExistsFailure,
  type MaximumLengthExceededFailure,
  type MinimumLengthNotMetFailure,
  type BlankIdentifierFailure,
  type EmptyIdentifierFailure,
  AggregateConcurrencyFailure,
  AggregateNotFoundFailure,
  type DateInFutureFailure,
  type DateBeforeFailure,
  type StringFailure,
} from 'server/library/ddd/errors';
import {
  GuardNonEmptyArray,
  type NonEmptyArray,
} from 'server/library/ddd/domain/invariants/array/non-empty-array';
import { type DomainGetBySpecification } from 'server/library/ddd/domain/repository/capabilities/get-by-specification';
import {
  type FromDateFailures,
  UniqueIdentifier,
  Specification,
  Task,
} from 'server/library/ddd/primitives';
import { DomainRepository } from 'server/library/ddd/domain/repository/domain-repository';

import type { StoryDatabase } from './story-database';
import type { Story } from './story';

import {
  StoryInsertSerializer,
  StoryUpdateSerializer,
} from './story-serializers';
import { StoryRehydrator } from './story-rehydrator';

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
  public readonly insertSerializer = new StoryInsertSerializer();
  public readonly updateSerializer = new StoryUpdateSerializer();
  public readonly rehydrator = new StoryRehydrator();

  /** @inheritdoc */
  public getBySpecification(
    specification: Specification<Story<'persisted'>>,
  ): Task<
    NonEmptyArray<Story<'persisted'>>,
    | (
      | StringOrNumberIdentifierFailure
      | MaximumLengthExceededFailure
      | MinimumLengthNotMetFailure
      | EmptyIdentifierFailure
      | BlankIdentifierFailure
      | DateInFutureFailure
      | DateBeforeFailure
      | FromDateFailures
      | StringFailure
    )[]
    | NoAggregateSatisfiesSpecificationFailure
  > {
    return this.persistence
      .getAll()
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .refine(stories => this.rehydrator.rehydrateList(stories))
      .map(ss => ss.filter(s => specification.isSatisfiedBy(s)))
      .ensure(
        GuardNonEmptyArray.predicate,
        new NoAggregateSatisfiesSpecificationFailure(specification),
      );
  }

  /** @inheritdoc */
  public getById(
    id: UniqueIdentifier,
  ): Task<
    Story<'persisted'>,
    | StringOrNumberIdentifierFailure
    | MaximumLengthExceededFailure
    | MinimumLengthNotMetFailure
    | AggregateNotFoundFailure
    | EmptyIdentifierFailure
    | BlankIdentifierFailure
    | DateInFutureFailure
    | DateBeforeFailure
    | FromDateFailures
    | StringFailure
  > {
    return this.persistence
      .getById(id.toString())
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .map(ss => ss[0])
      .refine(s => this.rehydrator.rehydrate(s));
  }

  /** @inheritdoc */
  public delete(id: UniqueIdentifier): Task<void, AggregateNotFoundFailure> {
    return this.persistence
      .delete(id.toString())
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .map(() => void 0);
  }

  /** @inheritdoc */
  public updateWithLock(
    domain: Story<'persisted'>,
  ): Task<
    UniqueIdentifier,
    | StringOrNumberIdentifierFailure
    | AggregateConcurrencyFailure
    | AggregateNotFoundFailure
    | EmptyIdentifierFailure
    | BlankIdentifierFailure
    | StringFailure
  > {
    return this.updateSerializer
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.updateWithLock(row))
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(
        GuardNonEmptyArray.predicate,
        new AggregateConcurrencyFailure(domain.id),
      )
      .refine(value => UniqueIdentifier.create(value[0]));
  }

  /** @inheritdoc */
  public getAll(): Task<
    NonEmptyArray<Story<'persisted'>>,
    | (
      | StringOrNumberIdentifierFailure
      | MaximumLengthExceededFailure
      | MinimumLengthNotMetFailure
      | EmptyIdentifierFailure
      | BlankIdentifierFailure
      | DateInFutureFailure
      | DateBeforeFailure
      | FromDateFailures
      | StringFailure
    )[]
    | AggregateNotFoundFailure
  > {
    return this.persistence
      .getAll()
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .refine(stories => this.rehydrator.rehydrateList(stories))
      .refine(stories => GuardNonEmptyArray.refine(stories, 'Stories'));
  }

  /** @inheritdoc */
  public create(
    domain: Story<'new'>,
  ): Task<void, AggregateAlreadyExistsFailure> {
    return this.insertSerializer
      .serialize(domain)
      .toTask()
      .flatMap(row => this.persistence.create(row))
      .mapError(error => this.errorTranslator.translateOrThrow(error));
  }
}
