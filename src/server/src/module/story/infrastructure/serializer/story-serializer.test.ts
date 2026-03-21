import type { StorySelectSchema } from 'server/infrastructure/database/schema/story';

import { StorySerializer } from './story-serializer';
import { Story } from '../../domain/story';

describe('story serializers', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-09T12:34:56'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const createdAt = new Date('2025-06-09T12:34:55'); // 1 second before fake now
  const expiresAt = new Date('2025-06-10T12:34:56'); // 24h after fake now

  const raw: StorySelectSchema = {
    authorId: '00000000-0000-0000-0000-000000000001',
    id: '00000000-0000-0000-0000-000000000002',
    body: 'This is the body',
    title: 'Test story',
    isBanned: false,
    version: 0,
    createdAt,
    expiresAt,
  };

  const story = Story.rehydrate(raw);

  function shouldSerializeStoryToDTO(serializer: (typeof StorySerializer)['insert' | 'update']) {
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

  function shouldSerializeListOfStoriesToDTOs(serializer: (typeof StorySerializer)['insert' | 'update']) {
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
