import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a value is not a valid ISO 8601 date string.
 */
export type ISOStringFailure = {
  readonly _tag: 'ISOStringFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const ISOStringFailure = (name: string): ISOStringFailure =>
  domainFailure({
    _tag: 'ISOStringFailure',
    name,
  });

/**
 * ---
 * Checks that a value is a valid ISO 8601 date string.
 * ---
 * @param value - The value to check.
 */
function isISOString(value: unknown): value is string {
  // ISO 8601 regex (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD).
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  return guardString('').predicate(value) && iso8601Regex.test(value) ? true : false;
}

export const guardISOString = (name: string) => makeGuards(isISOString, ISOStringFailure(name));
