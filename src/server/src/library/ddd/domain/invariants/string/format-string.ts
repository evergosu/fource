import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a `string` does not match the provided `regex` pattern.
 */
export type FormatStringFailure = {
  readonly _tag: 'FormatStringFailure';
  readonly pattern: RegExp;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const FormatStringFailure = (
  name: string,
  pattern: RegExp,
): FormatStringFailure =>
  domainFailure({
    _tag: 'FormatStringFailure',
    pattern,
    name,
  });

/**
 * ---
 * Checks that a `string` matches the provided `regex` pattern.
 * ---
 * @param pattern - Regex pattern to match.
 */
function hasFormat(pattern: RegExp) {
  return (value: unknown): value is string =>
    guardString('').predicate(value) && pattern.test(value);
}

/**
 * ---
 * Guard for provided format of string.
 * ---
 * @param name The name of the value being validated.
 * @param pattern - Regex pattern to match.
 */
export function guardFormatString(name: string, pattern: RegExp) {
  return makeGuards(hasFormat(pattern), FormatStringFailure(name, pattern));
}
