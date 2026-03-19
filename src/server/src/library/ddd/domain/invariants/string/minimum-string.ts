import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a string failed to meet the minimum required length.
 */
export type MinimumLengthStringFailure = {
  readonly _tag: 'MinimumLengthStringFailure';
  readonly minimumLength: number;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const MinimumLengthStringFailure = (name: string, minimumLength: number): MinimumLengthStringFailure =>
  domainFailure({
    _tag: 'MinimumLengthStringFailure',
    minimumLength,
    name,
  });

/**
 * ---
 * Checks that a `string` has at least the given minimum length.
 * ---
 * @param minimumLength - The minimum required length.
 */
function isMoreThan(minimumLength: number) {
  return (value: unknown): value is string => guardString('').predicate(value) && value.length >= minimumLength;
}

/**
 * ---
 * Guard for minimum string length.
 * ---
 * @param name The name of the value being validated.
 * @param minimumLength - The minimum required length.
 */
export function guardMinimumLengthString(name: string, minimumLength: number) {
  return makeGuards(isMoreThan(minimumLength), MinimumLengthStringFailure(name, minimumLength));
}
