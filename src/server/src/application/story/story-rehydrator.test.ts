import type { StorySelectSchema } from 'server/database/schema/story';

import { StoryRehydrator } from './story-rehydrator';
import { Story } from './story';

describe('story rehydrator', () => {
  const createdAt = new Date();

  const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

  const expiresAt = new Date(createdAt.getTime() + TWENTY_FOUR_HOURS);

  const raw: StorySelectSchema = {
    authorId: '00000000-0000-0000-0000-000000000001',
    id: '00000000-0000-0000-0000-000000000002',
    body: 'This is the body',
    title: 'Test story',
    version: 0,
    createdAt,
    expiresAt,
  };

  describe('story rehydrator', () => {
    it('should rehydrate story from dto', () => {
      const storyResult = StoryRehydrator.rehydrate(raw);

      expect(storyResult.isSuccess()).toBe(true);

      const story = storyResult.value;

      expect(story).toBeInstanceOf(Story);

      expect(story.id.toValue()).toBe(raw.id);
      expect(story.authorId.authorId).toBe(raw.authorId);
      expect(story.title.title).toBe(raw.title);
      expect(story.body.body).toBe(raw.body);
      expect(story.createdAt().toDate().getTime()).toBe(
        raw.createdAt.getTime(),
      );
      expect(story.expiresAt().toDate().getTime()).toBe(
        raw.expiresAt.getTime(),
      );
    });

    it('should rehydrate array of stories from dtos array', () => {
      const storyResult = StoryRehydrator.rehydrateList([raw, raw]);

      expect(storyResult.isSuccess()).toBe(true);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const story = storyResult.value.at(0)!;

      expect(story).toBeInstanceOf(Story);

      expect(story.id.toValue()).toBe(raw.id);
      expect(story.authorId.authorId).toBe(raw.authorId);
      expect(story.title.title).toBe(raw.title);
      expect(story.body.body).toBe(raw.body);
      expect(story.createdAt().toDate().getTime()).toBe(
        raw.createdAt.getTime(),
      );
      expect(story.expiresAt().toDate().getTime()).toBe(
        raw.expiresAt.getTime(),
      );
    });
  });
});
