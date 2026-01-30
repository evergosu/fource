/* eslint-disable prettier/prettier */
import type { UpdateWithLock } from 'server/library/ddd/infrastructure/repository/capabilities/update-with-lock';
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
  type FromDateFailures,
  UniqueIdentifier,
  Repository,
  Task,
} from 'server/library/ddd/primitives';
import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';
import { DrizzleOptimisticLockExecutor } from 'server/library/ddd/infrastructure/orm/drizzle-lock';
import { GuardNonEmptyArray } from 'server/library/ddd/domain/invariants/array/non-empty-array';
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
  Create<StoryInsertSerializer>,
  GetAll<StoryRehydrator>,
  UpdateWithLock<StoryUpdateSerializer>,
  Delete<Story<'persisted'>> {
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
  delete(id: UniqueIdentifier): Task<void, AggregateNotFoundFailure> {
    return Task.fromPromise(async () => {
      await this.database.delete(story).where(eq(story.id, id.toString()));
    }).mapError(error => this.errorTranslator.translateOrThrow(error));
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
    | AggregateNotFoundFailure
  > {
    return Task.fromPromise(
      async () => await this.database.select().from(story),
    )
      .mapError(error => this.errorTranslator.translateOrThrow(error))
      .ensure(GuardNonEmptyArray.predicate, new AggregateNotFoundFailure())
      .flatMap(stories => this.rehydrator.rehydrateList(stories).toTask());
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
