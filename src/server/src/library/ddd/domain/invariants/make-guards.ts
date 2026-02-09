import { Result } from 'server/library/ddd/primitives';

import type { DomainFailure } from '../issues/failure';

export interface Guard<T, F extends DomainFailure> {
  validate(value: unknown): Result<void, F>;
  predicate(value: unknown): value is T;
  refine(value: unknown): Result<T, F>;
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
export function makeGuards<T, F extends DomainFailure>(
  is: (value: unknown) => value is T,
  failure: F,
): Guard<T, F> {
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
    validate(value: unknown): Result<void, F> {
      return is(value) ? Result.ok() : Result.fail(failure);
    },
    /**
     * ---
     * Refines value with a new type, based on predicate.
     * ---
     * @param value - value to refine
     */
    refine(value: unknown): Result<T, F> {
      return is(value) ? Result.ok(value) : Result.fail(failure);
    },
  };
}
