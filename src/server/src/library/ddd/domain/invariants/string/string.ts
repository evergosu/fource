import type { MinimumLengthStringFailure } from './minimum-string';
import type { MaximumLengthStringFailure } from './maximum-string';
import type { FormatStringFailure } from './format-string';
import type { EmptyStringFailure } from './empty-string';
import type { EmailStringFailure } from './email-string';
import type { ISOStringFailure } from './iso-string';

import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';

/**
 * ---
 * Indicates that value is not a string.
 */
export type StringFailure = {
  readonly _tag: 'StringFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const StringFailure = (name: string): StringFailure =>
  domainFailure({
    _tag: 'StringFailure',
    name,
  });

/**
 * ---
 * Checks that value is a `string`.
 * ---
 * @param value - The value to check.
 */
function isString(value: unknown): value is string {
  return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
}

export const guardString = (name: string) => makeGuards(isString, StringFailure(name));

export type StringFailures =
  | MinimumLengthStringFailure
  | MaximumLengthStringFailure
  | FormatStringFailure
  | EmptyStringFailure
  | EmailStringFailure
  | ISOStringFailure
  | StringFailure;
