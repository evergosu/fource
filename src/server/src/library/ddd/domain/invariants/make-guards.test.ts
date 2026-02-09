import type { DomainFailure } from '../issues/failure';
import type { Guard } from './make-guards';

/**
 * ---
 * Contract test for guards produced by `makeGuards`.
 * ---
 * Verifies predicate / validate / refine consistency.
 * ---
 * @param parameters - settings for current guard instance.
 * @param parameters.guard - guard instance under test.
 * @param parameters.valid - values for valid result.
 * @param parameters.invalid - values for invalid result.
 * @param parameters.failure - failure to produce on invalid result.
 */
export function testGuardContract<T, F extends DomainFailure>(parameters: {
  invalid: readonly unknown[];
  valid: readonly unknown[];
  guard: Guard<T, F>;
  failure: F;
}) {
  it('should satisfy guard contract', () => {
    const { invalid, failure, guard, valid } = parameters;

    for (const value of valid) {
      expect(guard.predicate(value)).toBe(true);

      const v = guard.validate(value);
      expect(v.isSuccess()).toBe(true);

      const r = guard.refine(value);
      expect(r.isSuccess()).toBe(true);
      expect(r.value).toEqual(value);
    }

    for (const value of invalid) {
      expect(guard.predicate(value)).toBe(false);

      const v = guard.validate(value);
      expect(v.isFailure()).toBe(true);
      expect(v.error).toBe(failure);

      const r = guard.refine(value);
      expect(r.isFailure()).toBe(true);
      expect(r.error).toBe(failure);
    }
  });
}
