import type { BeforeDateFailure } from './before-date';
import type { FutureDateFailure } from './future-date';
import type { AfterDateFailure } from './after-date';
import type { PastDateFailure } from './past-date';

import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';

/**
 * ---
 * Indicates that a `value` is not a valid javascript `Date` object.
 */
export type DateFailure = {
  readonly _tag: 'DateFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const DateFailure = (name: string): DateFailure =>
  domainFailure({
    _tag: 'DateFailure',
    name,
  });

/**
 * ---
 * Checks that a `value` is a valid javascript `Date` object.
 * ---
 * @param value - The value to check.
 */
function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export const guardDate = (name: string) => makeGuards(isDate, DateFailure(name));

export type DateFailures = BeforeDateFailure | FutureDateFailure | AfterDateFailure | PastDateFailure | DateFailure;
