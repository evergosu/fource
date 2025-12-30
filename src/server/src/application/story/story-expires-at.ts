import { Guard, Time } from 'server/library/ddd/primitives';

import { StoryCreatedAt } from './story-created-at';

/**
 * `Value Object` representing the expiration time of a `Story`.
 *
 * Invariants:
 * - must be a valid date/time.
 * - must be strictly after the `Story`'s creation time.
 * - typically set to exactly time-to-live after `StoryCreatedAt`.
 */
export class StoryExpiresAt extends Time<StoryExpiresAt> {
  private constructor(value: Date) {
    super(value);
  }

  /**
   * Creates a new `StoryExpiresAt` instance from a provided date/time.
   * @param date - The date object.
   * @param validators - The `StoryCreatedAt` instance for validation.
   * @returns `Result` with:
   * - `StoryExpiresAt`
   * - `ApplicationFailure`
   */
  public static _internalCreate(
    date: Date,
    validators: [createdAt: StoryCreatedAt],
  ) {
    const [createdAt] = validators;

    return Guard.againstDateBefore(
      date,
      createdAt.toDate(),
      'StoryExpiresAt',
    ).map(() => new StoryExpiresAt(date));
  }
}
