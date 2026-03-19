import { StoryCreatedAt } from './story-created-at';
import { StoryExpiresAt } from './story-expires-at';

describe('story expires at', () => {
  it('should succeed when date is after createdAt', () => {
    const result = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z').flatMap(createdAt =>
      StoryExpiresAt.fromISOString('2025-08-13T10:15:30.000Z', [createdAt]),
    );

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toBeInstanceOf(StoryCreatedAt);
  });

  it('should fail if before createdAt', () => {
    const result = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z').flatMap(s =>
      StoryExpiresAt.fromISOString('2025-08-10T10:15:30.000Z', [s]),
    );

    expect(result.isFailure()).toBe(true);
    expect(result.error.name).toBe(StoryExpiresAt.name);
    expect(result.error._tag).toBe('TimeFailure');
    expect(result.error.cause._tag).toBe('BeforeDateFailure');
  });
});
