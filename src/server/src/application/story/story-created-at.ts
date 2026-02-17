import { guardPastDate } from 'server/library/ddd/domain/invariants/date/past-date';
import { Result, Time } from 'server/library/ddd/primitives';

/**
 * ---
 * `Value Object` representing the creation time of a `Story`.
 * ---
 * Invariants:
 * - must not be in the future (UTC).
 */
export class StoryCreatedAt extends Time<StoryCreatedAt> {
  /**
   * ---
   * Creates a new `StoryCreatedAt` value object.
   * ---
   * @param date - The date object.
   */
  public static _internalCreate(date: Date) {
    return Result.ok(date)
      .validate(guardPastDate(this.name))
      .map(() => new StoryCreatedAt(date));
  }
}
