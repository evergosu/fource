import { Result, Time } from 'server/library/ddd/primitives';

import { StoryExpiresTimeNotMatchTTLFailure } from './story-failures';
import { StoryCreatedAt } from './story-created-at';

/**
 * Value Object representing the expiration time of a Story.
 *
 * Invariants:
 * - must be a valid date/time.
 * - must be strictly after the Story's creation time.
 * - typically set to exactly {@link StoryExpiresAt.timeToLive} after {@link StoryCreatedAt}.
 */
export class StoryExpiresAt extends Time<StoryExpiresAt> {
  private static timeToLive = 24 * 60 * 60 * 1000;

  private constructor(value: Date) {
    super(value);
  }

  /**
   * Creates a new `StoryExpiresAt` instance from a provided date/time.
   * @param date - The date object.
   * @param validators - The StoryCreatedAt instance for validation.
   * @returns `Result` wrapping the new `StoryExpiresAt` or a:
   * - StoryExpiresTimeNotMatchTTLFailure
   */
  public static internalCreate(
    date: Date,
    validators: [createdAt: StoryCreatedAt],
  ): Result<StoryExpiresAt, StoryExpiresTimeNotMatchTTLFailure> {
    const expiresAt = new StoryExpiresAt(date);

    const [createdAt] = validators;

    const expiry = createdAt.addMilliSeconds(StoryExpiresAt.timeToLive).value;

    return Result.fromBoolean(
      expiresAt.equals(expiry),
      new StoryExpiresTimeNotMatchTTLFailure(),
      expiresAt,
    );
  }

  /**
   * Creates a `StoryExpiresAt` exactly {@link StoryExpiresAt.timeToLive} after a given `StoryCreatedAt`.
   * @param createdAt - The creation time of the story.
   * @returns `Result` wrapping the new `StoryExpiresAt` set to {@link StoryExpiresAt.timeToLive} after creation or a:
   * - StoryExpiresTimeNotMatchTTLFailure
   */
  public static fromCreatedAt(
    createdAt: StoryCreatedAt,
  ): Result<StoryExpiresAt, StoryExpiresTimeNotMatchTTLFailure> {
    const expiry = createdAt.addMilliSeconds(StoryExpiresAt.timeToLive, [
      createdAt,
    ]);

    return this.internalCreate(expiry.value.toDate(), [createdAt]);
  }
}
