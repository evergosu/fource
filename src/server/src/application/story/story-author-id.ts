import {
  UniqueIdentifier,
  ValueObject,
  Guard,
} from 'server/library/ddd/primitives';

type Properties = Record<'authorId', string>;

/**
 * ---
 * Represents a validated, non-empty author identifier of the `Story`.
 */
export class StoryAuthorId extends ValueObject<Properties> {
  private constructor(properties: Properties) {
    super(properties);
  }

  /**
   * ---
   * Creates a new `StoryAuthorId` value object.
   * ---
   * @param authorId - The raw title string.
   * @returns `Result` with:
   * - `StoryAuthorId`
   * - `ApplicationFailure`
   */
  public static create(authorId: string) {
    return Guard.againstNullOrUndefined(authorId, 'authorId')
      .flatMap(() => UniqueIdentifier.create(authorId))
      .map(id => new StoryAuthorId({ authorId: id.toString() }));
  }

  /**
   * ---
   * The underlying string value of the author identifier.
   */
  get authorId(): string {
    return this.properties.authorId;
  }
}
