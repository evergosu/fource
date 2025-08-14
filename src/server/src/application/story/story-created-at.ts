import type {
  DateInFutureFailure,
  DateFailure,
} from 'server/library/ddd/errors';

import { Result, Guard, Time } from 'server/library/ddd/primitives';

/**
 * Value Object representing the creation time of a Story.
 * Invariants:
 * - must not be in the future (UTC).
 */
export class StoryCreatedAt extends Time<StoryCreatedAt> {
  /**
   * Creates a new `StoryCreatedAt` value object.
   * @param date - The raw date object.
   * @returns `Result` wrapping the new `StoryCreatedAt` or a:
   * - DateInFutureFailure
   * - DateFailure
   */
  public static create(
    date: Date,
  ): Result<StoryCreatedAt, DateInFutureFailure | DateFailure> {
    const guard = Guard.for({ date });

    const result = guard.againstDateInFuture('date');

    return result.map(() => new StoryCreatedAt(date));
  }

  /**
   * The underlying value of the date.
   */
  get date(): Date {
    return this.properties.date;
  }
}
