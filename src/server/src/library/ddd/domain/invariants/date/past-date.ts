import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardDate } from './date';

/**
 * ---
 * Indicates that a value is not `in the past` (compared to now).
 */
export type PastDateFailure = {
  readonly _tag: 'PastDateFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const PastDateFailure = (name: string): PastDateFailure =>
  domainFailure({
    _tag: 'PastDateFailure',
    name,
  });

/**
 * ---
 * Checks that a value is `in the past` (compared to now).
 * ---
 * @param value - The value to check.
 */
function isPast(value: unknown): value is Date {
  return guardDate('').predicate(value) && value.getTime() < Date.now();
}

export const guardPastDate = (name: string) => makeGuards(isPast, PastDateFailure(name));
