/* eslint-disable prettier/prettier */
import type { DomainGetAll } from 'server/library/ddd/domain/repository/capabilities/get-all';
import type { StorySelectSchema } from 'server/infrastructure/database/schema/story';

import {
  AggregateSpecificationFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { type DomainGetBySpecification } from 'server/library/ddd/domain/repository/capabilities/get-by-specification';
import {
  type NonEmptyArray,
  guardEmptyArray,
} from 'server/library/ddd/domain/invariants/array/empty-array';
import { Specification, Task } from 'server/library/ddd/primitives';
import { identity } from 'server/library/ddd/types/identity';

import { type StoryFailureMap, StoryErrorPolicy } from './story-error-policy';
import { StoryDatabase } from './story-database';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class StoryQueryRepository
  implements
  DomainGetAll<StorySelectSchema, StoryFailureMap>,
  DomainGetBySpecification<StorySelectSchema, StoryFailureMap> {
  readonly errorPolicy = StoryErrorPolicy;

  /**
   * ---
   * Creates new read repository instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  public constructor(private readonly persistence: StoryDatabase) { }

  /** @inheritdoc */
  public getBySpecification(
    specification: Specification<StorySelectSchema>,
  ): Task<
    NonEmptyArray<StorySelectSchema>,
    | AggregateSpecificationFailure
    | AggregatePersistenceFailure
    | AggregateNotFoundFailure
  > {
    return this.persistence
      .getAll()
      .mapError(this.errorPolicy.translate('getBySpecification'))
      .map(ss => ss.filter(s => specification.isSatisfiedBy(s)))
      .refine(guardEmptyArray(StoryQueryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateSpecificationFailure(
          StoryQueryRepository.name,
          specification,
        ),
        _: identity,
      });
  }

  /** @inheritdoc */
  public getAll(): Task<
    NonEmptyArray<StorySelectSchema>,
    AggregatePersistenceFailure | AggregateNotFoundFailure
  > {
    return this.persistence
      .getAll()
      .mapError(this.errorPolicy.translate('getAll'))
      .refine(guardEmptyArray(StoryQueryRepository.name))
      .matchFailure({
        EmptyArrayFailure: AggregateNotFoundFailure(StoryQueryRepository.name),
        _: identity,
      });
  }
}
