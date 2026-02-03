/* eslint-disable prettier/prettier */
import type { UpdateWithLock } from 'server/library/ddd/infrastructure/repository/capabilities/update-with-lock';
import type { GetById } from 'server/library/ddd/infrastructure/repository/capabilities/get-by-id';
import type { GetAll } from 'server/library/ddd/infrastructure/repository/capabilities/get-all';
import type { Create } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { Delete } from 'server/library/ddd/infrastructure/repository/capabilities/delete';
import type { Database } from 'server/database/database';

import {
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
  NoAggregateSatisfiesSpecificationFailure,
  type GetBySpecification,
} from 'server/library/ddd/infrastructure/repository/capabilities/get-by-specification';
import {
  type FromDateFailures,
  UniqueIdentifier,
  Specification,
  Repository,
  Task,
} from 'server/library/ddd/primitives';
import {
  GuardNonEmptyArray,
  type NonEmptyArray,
} from 'server/library/ddd/domain/invariants/array/non-empty-array';
import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';
import { DrizzleOptimisticLockExecutor } from 'server/library/ddd/infrastructure/orm/drizzle-lock';
import { story } from 'server/database/schema/story';
import { eq } from 'drizzle-orm';

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
  extends Repository<AggregateAlreadyExistsFailure | AggregateNotFoundFailure>
  implements
  GetAll<StoryRehydrator>,
  GetById<StoryRehydrator>,
  Delete<Story<'persisted'>>,
  Create<StoryInsertSerializer>,
  GetBySpecification<StoryRehydrator>,
  UpdateWithLock<StoryUpdateSerializer> {
  readonly optimisticLockExecutor = new DrizzleOptimisticLockExecutor(story);
  readonly insertSerializer = new StoryInsertSerializer();
  readonly updateSerializer = new StoryUpdateSerializer();
  readonly rehydrator = new StoryRehydrator();
  /**
   * ---
   * Constructs a new `StoryRepository` instance.
   * ---
   * @param database - The one of possible database clients.
   */
  constructor(database: Database) {
    super(database, new PostgresErrorTranslator());
  }

  /** @inheritdoc */
  getBySpecification(
    specification: Specification<Story<'persisted'>>,
  ): Task<
    Story<'persisted'>[],
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
    return Task.fromPromise(
      async () => await this.database.select().from(story),
    )
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
  getById(
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
    return Task.fromPromise(
      async () =>
        await this.database
          .select()
          .from(story)
          .where(eq(story.id, id.toString())),
    )
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .map(ss => ss[0])
      .refine(s => this.rehydrator.rehydrate(s));
  }

  /** @inheritdoc */
  delete(id: UniqueIdentifier): Task<void, AggregateNotFoundFailure> {
    return Task.fromPromise(async () => {
      return await this.database
        .delete(story)
        .where(eq(story.id, id.toString()))
        .returning();
    })
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .map(() => void 0);
  }

  /** @inheritdoc */
  updateWithLock(
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
      .flatMap(values =>
        this.optimisticLockExecutor.execute(
          this.database
            .update(story)
            .set(values)
            .where(eq(story.id, values.id))
            .$dynamic(),
          values.version,
          domain.id,
        ),
      )
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .refine(value => UniqueIdentifier.create(value));
  }

  /** @inheritdoc */
  getAll(): Task<
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
    return Task.fromPromise(
      async () => await this.database.select().from(story),
    )
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .refine(stories => this.rehydrator.rehydrateList(stories))
      .refine(stories => GuardNonEmptyArray.refine(stories, 'Stories'));
  }

  /** @inheritdoc */
  create(domain: Story<'new'>): Task<void, AggregateAlreadyExistsFailure> {
    return this.insertSerializer
      .serialize(domain)
      .toTask()
      .flatMap(value =>
        Task.fromPromise(async () => {
          await this.database.insert(story).values(value);
        }),
      )
      .mapError(error => this.errorTranslator.translateOrThrow(error));
  }
}
