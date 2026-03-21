/* eslint-disable prettier/prettier */
import { guardMinimumLengthString } from 'server/library/ddd/domain/invariants/string/minimum-string';
import { guardMaximumLengthString } from 'server/library/ddd/domain/invariants/string/maximum-string';
import { type DomainFailure, domainFailure } from 'server/library/ddd/domain/issues/failure';
import { guardDefined } from 'server/library/ddd/domain/invariants/defined/defined';
import { guardString } from 'server/library/ddd/domain/invariants/string/string';
import { ValueObject, Result } from 'server/library/ddd/primitives';

type Properties = Record<'body', string>;

/**
 * ---
 * Represents a validated body of a `Story`.
 */
export class StoryBody extends ValueObject<Properties> {
  private constructor(properties: Properties) {
    super(properties);
  }

  /**
   * ---
   * Creates a new `StoryBody` value object.
   * ---
   * @param body - The raw body string.
   */
  public static create(body: unknown) {
    return Result.ok(body)
      .validate(guardDefined(this.name))
      .refine(guardString(this.name))
      .validate(guardMinimumLengthString(this.name, 10))
      .validate(guardMaximumLengthString(this.name, 1000))
      .matchFailure({
        _: StoryBodyFailure(this.name),
      })
      .map(body => new StoryBody({ body }));
  }

  /**
   * ---
   * The underlying string value of the body.
   */
  get body(): string {
    return this.properties.body;
  }
}

type StoryBodyFailure = {
  readonly _tag: 'StoryBodyFailure';
  readonly cause: DomainFailure;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const StoryBodyFailure =
  (name: string) =>
    (cause: DomainFailure): StoryBodyFailure =>
      domainFailure({
        _tag: 'StoryBodyFailure',
        cause,
        name,
      });
