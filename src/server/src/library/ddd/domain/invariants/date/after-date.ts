import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardDate } from './date';

/**
 * ---
 * Indicates that a value is not `after another`.
 */
export type AfterDateFailure = {
  readonly _tag: 'AfterDateFailure';
  readonly threshold: Date;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AfterDateFailure = (
  name: string,
  threshold: Date,
): AfterDateFailure =>
  domainFailure({
    _tag: 'AfterDateFailure',
    threshold,
    name,
  });

/**
 * ---
 * Checks that a value is `after another`.
 * ---
 * @param threshold - the limit to check against.
 */
function isAfter(threshold: Date) {
  return (value: unknown): value is Date =>
    guardDate('').predicate(value) && value.getTime() > threshold.getTime();
}

export const guardAfterDate = (name: string, threshold: Date) =>
  makeGuards(isAfter(threshold), AfterDateFailure(name, threshold));
