import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a string exceeded its allowed maximum length.
 */
export type MaximumLengthStringFailure = {
  readonly _tag: 'MaximumLengthStringFailure';
  readonly maximumLength: number;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const MaximumLengthStringFailure = (name: string, maximumLength: number): MaximumLengthStringFailure =>
  domainFailure({
    _tag: 'MaximumLengthStringFailure',
    maximumLength,
    name,
  });

/**
 * ---
 * Checks that a `string` not exceeded maximum length.
 * ---
 * @param maximumLength - The maximum allowed length.
 */
function isLessThan(maximumLength: number) {
  return (value: unknown): value is string => guardString('').predicate(value) && value.length <= maximumLength;
}

/**
 * ---
 * Guard for maximum string length.
 * ---
 * @param name The name of the value being validated.
 * @param maximumLength - The maximum allowed length.
 */
export function guardMaximumLengthString(name: string, maximumLength: number) {
  return makeGuards(isLessThan(maximumLength), MaximumLengthStringFailure(name, maximumLength));
}
