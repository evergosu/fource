import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardDate } from './date';

/**
 * ---
 * Indicates that a value is not `before another`.
 */
export type BeforeDateFailure = {
  readonly _tag: 'BeforeDateFailure';
  readonly threshold: Date;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const BeforeDateFailure = (
  name: string,
  threshold: Date,
): BeforeDateFailure =>
  domainFailure({
    _tag: 'BeforeDateFailure',
    threshold,
    name,
  });

/**
 * ---
 * Checks that a value is `before another`.
 * ---
 * @param threshold - the limit to check against.
 */
function isBefore(threshold: Date) {
  return (value: unknown): value is string =>
    guardDate('').predicate(value) && value.getTime() < threshold.getTime();
}

export const guardBeforeDate = (name: string, threshold: Date) =>
  makeGuards(isBefore(threshold), BeforeDateFailure(name, threshold));
