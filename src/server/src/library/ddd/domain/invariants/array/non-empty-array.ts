import { EmptyArrayFailure } from 'server/library/ddd/errors';
import { Result } from 'server/library/ddd/primitives';

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
 * ---
 * Checks that value is a `NonEmptyArray`.
 * ---
 * @param value - The value to check.
 */
function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

export const GuardNonEmptyArray = {
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
   * @param name - name of the value to use in error messages
   */
  validate(value: unknown[], name: string): Result<void, EmptyArrayFailure> {
    return isNonEmptyArray(value)
      ? Result.ok()
      : Result.fail(new EmptyArrayFailure(name));
  },
  /**
   * ---
   * Refines value with a new type, based on predicate.
   * ---
   * @param value - value to refine
   * @param name - name of the value to use in error messages
   */
  refine<T>(
    value: T[],
    name: string,
  ): Result<NonEmptyArray<T>, EmptyArrayFailure> {
    return isNonEmptyArray(value)
      ? Result.ok(value)
      : Result.fail(new EmptyArrayFailure(name));
  },
};
