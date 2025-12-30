import { DateBeforeFailure } from 'server/library/ddd/errors';

import { StoryCreatedAt } from './story-created-at';
import { StoryExpiresAt } from './story-expires-at';

describe('story expires at', () => {
  it('should fail if before createdAt', () => {
    const createdAt = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z');

    const expiresAtBefore = StoryExpiresAt.fromISOString(
      '2025-08-10T10:15:30.000Z',
      [createdAt.value],
    );

    expect(expiresAtBefore.isFailure).toBe(true);
    expect(expiresAtBefore.error).toBeInstanceOf(DateBeforeFailure);
  });
});
