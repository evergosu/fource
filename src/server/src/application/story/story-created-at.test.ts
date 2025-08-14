import { DateInFutureFailure } from 'server/library/ddd/errors';

import { StoryCreatedAt } from './story-created-at';

describe('story created at', () => {
  it('should be able to be created', () => {
    const result = StoryCreatedAt.fromNow();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeInstanceOf(StoryCreatedAt);
  });

  it('should fail when date is in the future', () => {
    const future = new Date(Date.now() + 5000);

    const result = StoryCreatedAt.fromDate(future);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(DateInFutureFailure);
  });

  it('should succeed when date is in the past', () => {
    const past = new Date(Date.now() - 60_000);

    const result = StoryCreatedAt.fromDate(past);

    expect(result.isSuccess).toBe(true);
  });
});
