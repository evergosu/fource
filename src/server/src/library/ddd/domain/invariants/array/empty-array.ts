import { Result } from 'server/library/ddd/primitives';

import { type DomainFailure, domainFailure } from '../../issues/failure';

/**
 * ---
 * Represents an array that is statically guaranteed to contain
 * at least one element.
 * ---
 * This type encodes the invariant at the type level and allows
 * safe usage of operations like `head`, `reduce`, or indexed access
 * without additional runtime checks.
 * ---
 * @template T - Element type.
 * ---
 * ```ts
 * const values: NonEmptyArray<number> = [1, 2, 3];
 * const first = values[0]; // always defined
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Indicates that value is not an array or is empty.
 */
export type EmptyArrayFailure = {
  readonly _tag: 'EmptyArrayFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const EmptyArrayFailure = (name: string): EmptyArrayFailure =>
  domainFailure({
    _tag: 'EmptyArrayFailure',
    name,
  });

/**
 * ---
 * Checks that value is a `NonEmptyArray`.
 * ---
 * @param value - The value to check.
 */
function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

export const guardEmptyArray = (name: string) => ({
  /**
   * ---
   * Checks that value is a `string`.
   * ---
   * @param value - The value to check.
   */
  predicate: isNonEmptyArray,
  /**
   * ---
   * Validates value without returning nor refining it.
   * ---
   * @param value - value to validate
   */
  validate(value: unknown[]): Result<void, EmptyArrayFailure> {
    return isNonEmptyArray(value)
      ? Result.ok()
      : Result.fail(EmptyArrayFailure(name));
  },
  /**
   * ---
   * Refines value with a new type, based on predicate.
   * ---
   * @param value - value to refine
   */
  refine<T>(value: T[]): Result<NonEmptyArray<T>, EmptyArrayFailure> {
    return isNonEmptyArray(value)
      ? Result.ok(value)
      : Result.fail(EmptyArrayFailure(name));
  },
});
