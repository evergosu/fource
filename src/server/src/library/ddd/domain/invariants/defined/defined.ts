import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards, type Guard } from '../make-guards';

/**
 * ---
 * Indicates that a value is `null` or `undefined`.
 */
export type NullishFailure = {
  readonly _tag: 'NullishFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const NullishFailure = (name: string): NullishFailure =>
  domainFailure({
    _tag: 'NullishFailure',
    name,
  });

/**
 * ---
 * Checks that a value is neither `null` nor `undefined`.
 * ---
 * @param value - The value to check.
 */
function isDefined<T>(value: T): value is NonNullable<T> {
  // eslint-disable-next-line sonarjs/different-types-comparison
  return value !== null && value !== undefined;
}

export const guardDefined = <T>(
  name: string,
): Guard<T, NonNullable<T>, NullishFailure> =>
  makeGuards<T, NonNullable<T>, NullishFailure>(
    isDefined,
    NullishFailure(name),
  );
