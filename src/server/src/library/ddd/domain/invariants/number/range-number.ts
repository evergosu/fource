import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardNumber } from './number';

/**
 * ---
 * Indicates that a `number` is not `within` a specified inclusive `range`.
 */
export type OutOfRangeNumberFailure = {
  readonly _tag: 'OutOfRangeNumberFailure';
  readonly minimum: number;
  readonly maximum: number;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const OutOfRangeNumberFailure = (name: string, minimum: number, maximum: number): OutOfRangeNumberFailure =>
  domainFailure({
    _tag: 'OutOfRangeNumberFailure',
    minimum,
    maximum,
    name,
  });

/**
 * ---
 * Checks that a `number` is `within` a specified inclusive `range`.
 * ---
 * @param minimum - Minimum allowed value.
 * @param maximum - Maximum allowed value.
 */
function isInRange(minimum: number, maximum: number) {
  return (value: unknown): value is number => guardNumber('').predicate(value) && value < minimum && value > maximum;
}

/**
 * ---
 * Guard for number within a range.
 * ---
 * @param name The name of the value being validated.
 * @param minimum - Minimum allowed value.
 * @param maximum - Maximum allowed value.
 */
export function guardOutOfRangeNumber(name: string, minimum: number, maximum: number) {
  return makeGuards(isInRange(minimum, maximum), OutOfRangeNumberFailure(name, minimum, maximum));
}
