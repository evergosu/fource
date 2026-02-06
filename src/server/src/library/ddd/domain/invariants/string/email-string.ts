import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';
import { guardString } from './string';

/**
 * ---
 * Indicates that a `string` is not a valid `email address`.
 */
export type EmailStringFailure = {
  readonly _tag: 'EmailStringFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const EmailStringFailure = (name: string): EmailStringFailure =>
  domainFailure({
    _tag: 'EmailStringFailure',
    name,
  });

/**
 * ---
 * Checks that a `string` is a valid `email address`.
 * ---
 * @param value - The value to check.
 */
function isEmail(value: unknown): value is string {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]{2,}$/;

  return guardString('').predicate(value) && emailRegex.test(value)
    ? true
    : false;
}

export const guardEmailString = (name: string) =>
  makeGuards(isEmail, EmailStringFailure(name));
