import { ValueObject, Result, Guard } from 'server/library/ddd/primitives';

type Properties = Record<'body', string>;

/**
 * Represents a validated, non-empty body of a `Story`.
 */
export class StoryBody extends ValueObject<Properties> {
  private constructor(properties: Properties) {
    super(properties);
  }

  /**
   * Creates a new `StoryBody` value object.
   * @param body - The raw body string.
   * @returns `Result` wrapping the new `StoryBody` or a:
   * - `MaximumLengthExceededFailure`
   * - `MinimumLengthNotMetFailure`
   * - `NullOrUndefinedFailure`
   * - `StringFailure`
   */
  public static create(body: string) {
    const guard = Guard.for({ body });

    const result = Result.combine([
      guard.againstNullOrUndefined('body'),
      guard.againstMinimumLength('body', 10),
      guard.againstMaximumLength('body', 1000),
    ]);

    return result.map(() => new StoryBody({ body }));
  }

  /**
   * The underlying string value of the body.
   */
  get body(): string {
    return this.properties.body;
  }
}
