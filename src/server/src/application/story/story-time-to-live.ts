import { Result, Time } from 'server/library/ddd/primitives';

/**
 * `Value Object` representing the `timeToLive` of a `Story`.
 */
export class StoryTimeToLive extends Time<StoryTimeToLive> {
  /**
   * Creates a new `StoryTimeToLive` value object.
   * @param date - The date object.
   */
  public static _internalCreate(date: Date) {
    return Result.ok(new StoryTimeToLive(date));
  }
}
