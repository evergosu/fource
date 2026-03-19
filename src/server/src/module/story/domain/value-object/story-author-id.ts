/* eslint-disable prettier/prettier */
import { type DomainFailure, domainFailure } from 'server/library/ddd/domain/issues/failure';
import { UniqueIdentifier, ValueObject, Result } from 'server/library/ddd/primitives';
import { guardDefined } from 'server/library/ddd/domain/invariants/defined/defined';
import { guardString } from 'server/library/ddd/domain/invariants/string/string';

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
   */
  public static create(authorId: unknown) {
    return Result.ok(authorId)
      .validate(guardDefined(this.name))
      .validate(guardString(this.name))
      .flatMap(() => UniqueIdentifier.create(authorId))
      .matchFailure({ _: StoryAuthorFailure(this.name) })
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

type StoryAuthorFailure = {
  readonly _tag: 'StoryAuthorFailure';
  readonly cause: DomainFailure;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const StoryAuthorFailure =
  (name: string) =>
    (cause: DomainFailure): StoryAuthorFailure =>
      domainFailure({
        _tag: 'StoryAuthorFailure',
        cause,
        name,
      });
