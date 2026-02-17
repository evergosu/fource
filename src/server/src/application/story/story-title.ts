/* eslint-disable prettier/prettier */
import { guardMaximumLengthString } from 'server/library/ddd/domain/invariants/string/maximum-string';
import { guardMinimumLengthString } from 'server/library/ddd/domain/invariants/string/minimum-string';
import {
  type DomainFailure,
  domainFailure,
} from 'server/library/ddd/domain/issues/failure';
import { guardDefined } from 'server/library/ddd/domain/invariants/defined/defined';
import { guardString } from 'server/library/ddd/domain/invariants/string/string';
import { ValueObject, Result } from 'server/library/ddd/primitives';

type Properties = Record<'title', string>;

/**
 * ---
 * Represents a validated, non-empty title of a `Story`.
 */
export class StoryTitle extends ValueObject<Properties> {
  private constructor(properties: Properties) {
    super(properties);
  }

  /**
   * ---
   * Creates a new `StoryTitle` value object.
   * ---
   * @param title - The raw title string.
   */
  public static create(title: unknown) {
    return Result.ok(title)
      .validate(guardDefined(this.name))
      .refine(guardString(this.name))
      .validate(guardMinimumLengthString(this.name, 1))
      .validate(guardMaximumLengthString(this.name, 120))
      .matchFailure({ _: StoryTitleFailure(this.name) })
      .map(title => new StoryTitle({ title }));
  }

  /**
   * ---
   * The underlying string value of the title.
   */
  get title(): string {
    return this.properties.title;
  }
}

type StoryTitleFailure = {
  readonly _tag: 'StoryTitleFailure';
  readonly cause: DomainFailure;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const StoryTitleFailure =
  (name: string) =>
    (cause: DomainFailure): StoryTitleFailure =>
      domainFailure({
        _tag: 'StoryTitleFailure',
        cause,
        name,
      });
