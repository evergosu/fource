import { Result } from 'server/library/ddd/primitives';

import type { Failure } from '../issues/failure';

export interface Guard<I, O extends I, F extends Failure> {
  validate(value: I): Result<void, F>;
  predicate(value: I): value is O;
  refine(value: I): Result<O, F>;
}

/**
 * ---
 * Guards construction to provide validation
 * and refinement methods around common predicate.
 * ---
 * - ensures in common implementation for both.
 * ---
 * @param is - Predicate to use in guard checks.
 * @param failure - Error to produce on failed checks.
 */
export function makeGuards<I, O extends I, F extends Failure>(
  is: (value: I) => value is O,
  failure: F,
): Guard<I, O, F> {
  return {
    /**
     * ---
     * Checks that value is a `string`.
     * ---
     * @param value - The value to check.
     */
    predicate: is,
    /**
     * ---
     * Validates value without returning nor refining it.
     * ---
     * @param value - value to validate
     */
    validate(value: I): Result<void, F> {
      return is(value) ? Result.ok() : Result.fail(failure);
    },
    /**
     * ---
     * Refines value with a new type, based on predicate.
     * ---
     * @param value - value to refine
     */
    refine(value: I): Result<O, F> {
      return is(value) ? Result.ok(value) : Result.fail(failure);
    },
  };
}
