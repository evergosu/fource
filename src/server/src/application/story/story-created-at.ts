import type {
  DateInFutureFailure,
  DateFailure,
} from 'server/library/ddd/errors';

import { Result, Guard, Time } from 'server/library/ddd/primitives';

/**
 * `Value Object` representing the creation time of a `Story`.
 * Invariants:
 * - must not be in the future (UTC).
 */
export class StoryCreatedAt extends Time<StoryCreatedAt> {
  /**
   * Creates a new `StoryCreatedAt` value object.
   * @param date - The date object.
   * @returns `Result` wrapping the new `StoryCreatedAt` or a:
   * - DateInFutureFailure
   * - DateFailure
   */
  public static _internalCreate(
    date: Date,
  ): Result<StoryCreatedAt, DateInFutureFailure | DateFailure> {
    return Guard.againstDateInFuture(date, 'date').map(
      () => new StoryCreatedAt(date),
    );
  }
}
