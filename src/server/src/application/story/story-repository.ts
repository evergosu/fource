import type { Create } from 'server/library/ddd/infrastructure/repository/capabilities/create';
import type { AggregateAlreadyExistsFailure } from 'server/library/ddd/errors';
import type { Database } from 'server/database/database';

import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';
import { Repository, Task } from 'server/library/ddd/primitives';
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
  // eslint-disable-next-line prettier/prettier
  implements Create<StoryInsertSerializer> {
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

  /**
   * @inheritdoc
   */
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
