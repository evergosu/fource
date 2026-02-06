import { type DomainFailure, domainFailure } from '../../issues/failure';
import { makeGuards } from '../make-guards';

/**
 * ---
 * Indicates that a value is `null` or `undefined`.
 */
export type UndefinedFailure = {
  readonly _tag: 'UndefinedFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const UndefinedFailure = (name: string): UndefinedFailure =>
  domainFailure({
    _tag: 'UndefinedFailure',
    name,
  });

/**
 * ---
 * Checks that a value is neither `null` nor `undefined`.
 * ---
 * @param value - The value to check.
 */
function isDefined(value: unknown): value is string {
  return value !== null && value !== undefined;
}

export const guarUndefined = (name: string) =>
  makeGuards(isDefined, UndefinedFailure(name));
