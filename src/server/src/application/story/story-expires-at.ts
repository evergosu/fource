import {
  type FromUnixMsFailures,
  Result,
  Time,
} from 'server/library/ddd/primitives';

import { StoryExpiresTimeNotMatchTTLFailure } from './story-failures';
import { StoryTimeToLive } from './story-time-to-live';
import { StoryCreatedAt } from './story-created-at';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const timeToLive = StoryTimeToLive.fromUnixMilliSeconds(TWENTY_FOUR_HOURS);

/**
 * `Value Object` representing the expiration time of a `Story`.
 *
 * Invariants:
 * - must be a valid date/time.
 * - must be strictly after the `Story`'s creation time.
 * - typically set to exactly `timeToLive` after `StoryCreatedAt`.
 */
export class StoryExpiresAt extends Time<StoryExpiresAt> {
  private constructor(value: Date) {
    super(value);
  }

  /**
   * Creates a new `StoryExpiresAt` instance from a provided date/time.
   * @param date - The date object.
   * @param validators - The `StoryCreatedAt` instance for validation.
   * @returns `Result` wrapping the new `StoryExpiresAt` or a:
   * - StoryExpiresTimeNotMatchTTLFailure
   * - FromUnixMsFailures
   */
  public static _internalCreate(
    date: Date,
    validators: [createdAt: StoryCreatedAt],
  ): Result<
    StoryExpiresAt,
    StoryExpiresTimeNotMatchTTLFailure | FromUnixMsFailures
  > {
    const expiresAt = new StoryExpiresAt(date);

    const [createdAt] = validators;

    return timeToLive
      .flatMap(ttl =>
        ttl.addMilliSeconds(createdAt.toUnixMilliSeconds(), validators),
      )
      .flatMapWiden(expiry =>
        Result.fromBoolean(
          expiresAt.equals(expiry),
          new StoryExpiresTimeNotMatchTTLFailure(),
          expiresAt,
        ),
      );
  }

  /**
   * Creates a `StoryExpiresAt` exactly `timeToLive` after a given `StoryCreatedAt`
   * @param createdAt - The creation time of the story.
   * @returns `Result` wrapping the new `StoryExpiresAt` set to `timeToLive` after creation or a:
   * - StoryExpiresTimeNotMatchTTLFiailure
   * - FromUnixMsFailures
   */
  public static fromCreatedAt(
    createdAt: StoryCreatedAt,
  ): Result<
    StoryExpiresAt,
    StoryExpiresTimeNotMatchTTLFailure | FromUnixMsFailures
  > {
    return timeToLive
      .flatMap(ttl => ttl.addMilliSeconds(createdAt.toUnixMilliSeconds()))
      .flatMapWiden(t => this.fromDate(t.toDate(), [createdAt]));
  }
}
