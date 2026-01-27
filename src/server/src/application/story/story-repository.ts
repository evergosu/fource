/* eslint-disable prettier/prettier */
import type { GetAll } from 'server/library/ddd/infrastructure/repository/capabilities/get-all';
import type { Create } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { Database } from 'server/database/database';

import {
  type StringOrNumberIdentifierFailure,
  type AggregateAlreadyExistsFailure,
  type MaximumLengthExceededFailure,
  type MinimumLengthNotMetFailure,
  type BlankIdentifierFailure,
  type EmptyIdentifierFailure,
  AggregateNotFoundFailure,
  type DateInFutureFailure,
  type DateBeforeFailure,
  type StringFailure,
} from 'server/library/ddd/errors';
import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';
import {
  type FromDateFailures,
  Repository,
  Task,
} from 'server/library/ddd/primitives';
import { story } from 'server/database/schema/story';

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
  extends Repository

  implements Create<StoryInsertSerializer>, GetAll<StoryRehydrator> {
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
      .ensure(stories => stories.length > 0, new AggregateNotFoundFailure())
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
