import type { OutOfRangeNumberFailure } from './range-number';

import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';

/**
 * ---
 * Indicates that value is not a `number`.
 */
export type NumberFailure = {
  readonly _tag: 'NumberFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const NumberFailure = (name: string): NumberFailure =>
  domainFailure({
    _tag: 'NumberFailure',
    name,
  });

/**
 * ---
 * Checks that value is a `number`.
 * ---
 * @param value - The value to check.
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export const guardNumber = (name: string) =>
  makeGuards(isNumber, NumberFailure(name));

export type NumberFailures = OutOfRangeNumberFailure | NumberFailure;
