import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a string is blank or contains only whitespaces.
 */
export type EmptyStringFailure = {
  readonly _tag: 'EmptyStringFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const EmptyStringFailure = (name: string): EmptyStringFailure =>
  domainFailure({
    _tag: 'EmptyStringFailure',
    name,
  });

/**
 * ---
 * Checks that a `string` is `not` only `whitespace`.
 * ---
 * @param value - The value to check.
 */
function isEmpty(value: unknown): value is string {
  return guardString('').predicate(value) && value.trim() !== '';
}

export const guardEmptyString = (name: string) => makeGuards(isEmpty, EmptyStringFailure(name));
