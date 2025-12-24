import { StoryExpiresTimeNotMatchTTLFailure } from './story-failures';
import { StoryTimeToLive } from './story-time-to-live';
import { StoryCreatedAt } from './story-created-at';
import { StoryExpiresAt } from './story-expires-at';

describe('story expires at', () => {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const timeToLive =
    StoryTimeToLive.fromUnixMilliSeconds(TWENTY_FOUR_HOURS).value;

  it('should create successfully from createdAt', () => {
    const createdAt = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z');

    const expiresAt = StoryExpiresAt.fromCreatedAt(createdAt.value);

    const expiryFromTimeToLive = new Date(
      createdAt.value.toUnixMilliSeconds() + timeToLive.toUnixMilliSeconds(),
    );

    expect(expiresAt.isSuccess).toBe(true);
    expect(expiresAt.value.toISOString()).toBe(
      expiryFromTimeToLive.toISOString(),
    );
  });

  it('should throw if validators has not been passed', () => {
    expect(() =>
      StoryExpiresAt.fromISOString('2025-08-10T10:15:30.000Z'),
    ).toThrow();
  });

  it('should fail if before createdAt', () => {
    const createdAt = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z');

    const expiresAtBefore = StoryExpiresAt.fromISOString(
      '2025-08-10T10:15:30.000Z',
      [createdAt.value],
    );

    expect(expiresAtBefore.isFailure).toBe(true);
    expect(expiresAtBefore.error).toBeInstanceOf(
      StoryExpiresTimeNotMatchTTLFailure,
    );
  });

  it('should fail if equals to createdAt', () => {
    const createdAt = StoryCreatedAt.fromISOString('2025-08-12T10:15:30.000Z');

    const expiresAtEquals = StoryExpiresAt.fromISOString(
      '2025-08-12T10:15:30.000Z',
      [createdAt.value],
    );

    expect(expiresAtEquals.isFailure).toBe(true);
    expect(expiresAtEquals.error).toBeInstanceOf(
      StoryExpiresTimeNotMatchTTLFailure,
    );
  });

  it('should fail if more than time to live after createdAt', () => {
    const createdAtDate = new Date('2025-08-12T10:15:30.000Z');

    const dateAfterTimeToLive = new Date(
      createdAtDate.getTime() + timeToLive.toUnixMilliSeconds() + 1000,
    );

    const createdAt = StoryCreatedAt.fromDate(createdAtDate);

    const expiresAt = StoryExpiresAt.fromDate(dateAfterTimeToLive, [
      createdAt.value,
    ]);

    expect(expiresAt.isFailure).toBe(true);
  });
});
