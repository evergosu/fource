import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardDate } from './date';

/**
 * ---
 * Indicates that a value is not `in the future` (compared to now).
 */
export type FutureDateFailure = {
  readonly _tag: 'FutureDateFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const FutureDateFailure = (name: string): FutureDateFailure =>
  domainFailure({
    _tag: 'FutureDateFailure',
    name,
  });

/**
 * ---
 * Checks that a value is `in the future` (compared to now).
 * ---
 * @param value - The value to check.
 */
function isFuture(value: unknown): value is Date {
  return guardDate('').predicate(value) && value.getTime() > Date.now()
    ? true
    : false;
}

export const guardFutureDate = (name: string) =>
  makeGuards(isFuture, FutureDateFailure(name));
