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

interface StorySerializer {
  update: Serializer<Story<'persisted'>, StoryUpdateSchema>;
  insert: Serializer<Story<'new'>, StoryInsertSchema>;
}

// eslint-disable-next-line sonarjs/no-redeclare
export const StorySerializer: StorySerializer = {
  update: {
    serialize(story) {
      return Result.ok({
        authorId: story.authorId.authorId,
        title: story.title.title,
        id: story.id.toString(),
        version: story.version,
        body: story.body.body,
      });
    },

    serializeList(stories) {
      return combineResults(stories.map(story => this.serialize(story)));
    },
  },
  insert: {
    serialize(story) {
      return Result.ok({
        authorId: story.authorId.authorId,
        title: story.title.title,
        id: story.id.toString(),
        version: story.version,
        body: story.body.body,
      });
    },
    serializeList(stories) {
      return combineResults(stories.map(story => this.serialize(story)));
    },
  },
};
