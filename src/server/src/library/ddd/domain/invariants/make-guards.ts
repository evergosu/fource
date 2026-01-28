import type { DomainFailure } from 'server/library/ddd/errors';

import { Result } from 'server/library/ddd/primitives';

/**
 * ---
 * Guards construction to provide validation
 * and refinement methods around common predicate.
 * ---
 * - ensures in common implementation for both.
 * ---
 * @param is - Predicate to use in guard checks.
 * @param makeError - Error to produce on failed checks.
 */
export function makeGuards<T, F extends DomainFailure>(
  is: (value: unknown) => value is T,
  makeError: (name: string) => F,
) {
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
     * @param name - name of the value to use in error messages
     */
    validate(value: unknown, name: string): Result<void, F> {
      return is(value) ? Result.ok() : Result.fail(makeError(name));
    },
    /**
     * ---
     * Refines value with a new type, based on predicate.
     * ---
     * @param value - value to refine
     * @param name - name of the value to use in error messages
     */
    refine(value: unknown, name: string): Result<T, F> {
      return is(value) ? Result.ok(value) : Result.fail(makeError(name));
    },
  };
}
