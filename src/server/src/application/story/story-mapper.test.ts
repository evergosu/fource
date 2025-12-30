import type { SelectStorySchema } from 'server/database/schema/story';

import { StoryMapper } from './story-mapper';
import { Story } from './story';

describe('story mapper', () => {
  const mapper = new StoryMapper();

  const createdAt = new Date();

  const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

  const expiresAt = new Date(createdAt.getTime() + TWENTY_FOUR_HOURS);

  const raw: SelectStorySchema = {
    authorId: '00000000-0000-0000-0000-000000000001',
    id: '00000000-0000-0000-0000-000000000002',
    body: 'This is the body',
    title: 'Test story',
    createdAt,
    expiresAt,
  };

  it('should rehydrate Story from DTO correctly', () => {
    const storyResult = mapper.toDomain(raw);

    expect(storyResult.isSuccess).toBe(true);

    const story = storyResult.value;

    expect(story).toBeInstanceOf(Story);

    expect(story.id.toValue()).toBe(raw.id);
    expect(story.authorId.authorId).toBe(raw.authorId);
    expect(story.title.title).toBe(raw.title);
    expect(story.body.body).toBe(raw.body);
    expect(story.createdAt().toDate().getTime()).toBe(raw.createdAt.getTime());
    expect(story.expiresAt().toDate().getTime()).toBe(raw.expiresAt.getTime());
  });

  it('should map Story to DTO correctly', () => {
    const story = Story.rehydrate(raw);

    const dtoResult = mapper.toDTO(story.value);

    expect(dtoResult.isSuccess).toBe(true);

    const dto = dtoResult.value;

    expect(dto.id).toBe(raw.id);
    expect(dto.authorId).toBe(raw.authorId);
    expect(dto.title).toBe(raw.title);
    expect(dto.body).toBe(raw.body);
    expect(dto.createdAt.getTime()).toBe(raw.createdAt.getTime());
    expect(dto.expiresAt.getTime()).toBe(raw.expiresAt.getTime());
  });

  it('should round-trip Story -> DTO -> Story consistently', () => {
    const storyResult = Story.rehydrate(raw);

    expect(storyResult.isSuccess).toBe(true);

    const story = storyResult.value;

    const dtoResult = mapper.toDTO(story);

    expect(dtoResult.isSuccess).toBe(true);

    const dto = dtoResult.value;

    const storyTwoResult = mapper.toDomain(dto);

    expect(storyTwoResult.isSuccess).toBe(true);

    const storyTwo = storyTwoResult.value;

    expect(story.equals(storyTwo)).toBeTruthy();

    expect(storyTwo.id.toValue()).toBe(story.id.toValue());
    expect(storyTwo.authorId.authorId).toBe(story.authorId.authorId);
    expect(storyTwo.title.title).toBe(story.title.title);
    expect(storyTwo.body.body).toBe(story.body.body);
    expect(storyTwo.createdAt().toDate().getTime()).toBe(
      story.createdAt().toDate().getTime(),
    );
    expect(storyTwo.expiresAt().toDate().getTime()).toBe(
      story.expiresAt().toDate().getTime(),
    );
  });
});
