import { ValueObject, Result, Guard } from 'server/library/ddd/primitives';

type Properties = Record<'title', string>;

/**
 * Represents a validated, non-empty title of a `Story`.
 */
export class StoryTitle extends ValueObject<Properties> {
  private constructor(properties: Properties) {
    super(properties);
  }

  /**
   * Creates a new `StoryTitle` value object.
   * @param title - The raw title string.
   * @returns `Result` wrapping the new `StoryTitle` or a:
   * - `MaximumLengthExceededFailure`
   * - `MinimumLengthNotMetFailure`
   * - `NullOrUndefinedFailure`
   * - `StringFailure`
   */
  public static create(title: string) {
    const guard = Guard.for({ title });

    const result = Result.combine([
      guard.againstNullOrUndefined('title'),
      guard.againstMinimumLength('title', 1),
      guard.againstMaximumLength('title', 120),
    ]);

    return result.map(() => new StoryTitle({ title }));
  }

  /**
   * The underlying string value of the title.
   */
  get title(): string {
    return this.properties.title;
  }
}
