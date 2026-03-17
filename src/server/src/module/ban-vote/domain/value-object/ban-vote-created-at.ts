import { guardPastDate } from 'server/library/ddd/domain/invariants/date/past-date';
import { Result, Time } from 'server/library/ddd/primitives';

/**
 * ---
 * `Value Object` representing the creation time of a `BanVote`.
 * ---
 * Invariants:
 * - must not be in the future (UTC).
 */
export class BanVoteCreatedAt extends Time<BanVoteCreatedAt> {
  /**
   * ---
   * Creates a new `BanVoteCreatedAt` value object.
   * ---
   * @param date - The date object.
   */
  public static _internalCreate(date: Date) {
    return Result.ok(date)
      .validate(guardPastDate(this.name))
      .map(() => new BanVoteCreatedAt(date));
  }
}
