import type {
  StoryInsertSchema,
  StoryUpdateSchema,
} from 'server/database/schema/story';

import {
  type Serializer,
  combineResults,
  Result,
} from 'server/library/ddd/primitives';

import { Story } from './story';

/**
 * ---
 * Provide serialization methods to ensure
 * DTO matching for insert operations.
 */
export class StoryInsertSerializer
  // eslint-disable-next-line prettier/prettier
  implements Serializer<Story<'new'>, StoryInsertSchema> {
  /** @inheritdoc */
  serialize(story: Story<'new'>) {
    return Result.ok({
      authorId: story.authorId.authorId,
      title: story.title.title,
      id: story.id.toString(),
      version: story.version,
      body: story.body.body,
    });
  }

  /** @inheritdoc */
  serializeList(domains: Story<'new'>[]) {
    return combineResults(domains.map(domain => this.serialize(domain)));
  }
}

/**
 * ---
 * Provide serialization methods to ensure
 * DTO matching for update operations.
 */
export class StoryUpdateSerializer
  // eslint-disable-next-line prettier/prettier
  implements Serializer<Story<'persisted'>, StoryUpdateSchema> {
  /** @inheritdoc */
  // eslint-disable-next-line sonarjs/no-identical-functions
  serialize(story: Story<'persisted'>) {
    return Result.ok({
      authorId: story.authorId.authorId,
      title: story.title.title,
      id: story.id.toString(),
      version: story.version,
      body: story.body.body,
    });
  }

  /** @inheritdoc */
  serializeList(domains: Story<'persisted'>[]) {
    return combineResults(domains.map(domain => this.serialize(domain)));
  }
}
