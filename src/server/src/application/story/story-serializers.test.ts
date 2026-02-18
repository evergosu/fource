import type { StorySelectSchema } from 'server/database/schema/story';

import { StorySerializer } from './story-serializers';
import { Story } from './story';

describe('story serializers', () => {
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

  const story = Story.rehydrate(raw);

  function shouldSerializeStoryToDTO(
    serializer: (typeof StorySerializer)['insert' | 'update'],
  ) {
    it('should serialize story to dto', () => {
      const dtoResult = serializer.serialize(story.value);

      expect(dtoResult.isSuccess()).toBe(true);

      const dto = dtoResult.value;

      expect(dto.id).toBe(raw.id);
      expect(dto.authorId).toBe(raw.authorId);
      expect(dto.title).toBe(raw.title);
      expect(dto.body).toBe(raw.body);
    });
  }

  function shouldSerializeListOfStoriesToDTOs(
    serializer: (typeof StorySerializer)['insert' | 'update'],
  ) {
    it('should serialize array of stories to dtos array', () => {
      const dtoResult = serializer.serializeList([story.value, story.value]);

      expect(dtoResult.isSuccess()).toBe(true);

      const dto = dtoResult.value;

      expect(dto.length).toBe(2);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dtoSnd = dtoResult.value.at(1)!;

      expect(dtoSnd.id).toBe(raw.id);
      expect(dtoSnd.authorId).toBe(raw.authorId);
      expect(dtoSnd.title).toBe(raw.title);
      expect(dtoSnd.body).toBe(raw.body);
    });
  }

  describe('insert', () => {
    shouldSerializeStoryToDTO(StorySerializer.insert);

    shouldSerializeListOfStoriesToDTOs(StorySerializer.insert);
  });

  describe('update', () => {
    shouldSerializeStoryToDTO(StorySerializer.update);

    shouldSerializeListOfStoriesToDTOs(StorySerializer.update);
  });
});
