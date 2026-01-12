/* eslint-disable unicorn/consistent-function-scoping */
/**
 * Law helpers for effect-like containers.
 * This module defines **behavioral laws**, not implementation tests.
 * ---
 * Laws ensure that:
 * - refactoring internals does not break composition
 * - chains remain predictable
 * - container semantics are stable over time
 * ---
 * ⚠️ Laws do NOT replace unit tests.
 * Laws protect *composition*, unit tests protect *intent*.
 */

/**
 * Verifies Functor laws for a container supporting `map`.
 * ---
 * Functor laws guarantee that `map`:
 * - does not change structure
 * - preserves identity
 * - composes predictably
 * ---
 * Laws:
 * 1. `Identity`:
 *    fa.map(x => x) ≡ fa
 * 2. `Composition`:
 *    fa.map(f).map(g) ≡ fa.map(x => g(f(x)))
 * ---
 * @param name Human-readable container name
 * @param make Factory method from a number
 * @param map Container implementation of map operation
 * @param equals Structural equality check
 */
export function functorLawsAsync<F>(
  name: string,
  make: (n: number) => F,
  map: (fa: F, f: (n: number) => number) => F,
  equals: (a: F, b: F) => Promise<boolean>,
) {
  describe(`${name} – Functor laws (async)`, () => {
    test('identity', async () => {
      const fa = make(1);

      expect(
        await equals(
          map(fa, x => x),
          fa,
        ),
      ).toBe(true);
    });

    test('composition', async () => {
      const fa = make(1);
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;

      expect(
        await equals(
          map(map(fa, f), g),
          map(fa, x => g(f(x))),
        ),
      ).toBe(true);
    });
  });
}

/**
 * Verifies Monad laws for a container supporting `flatMap`.
 * ---
 * Monad laws guarantee that sequencing:
 * - is associative
 * - does not introduce hidden behavior
 * - remains refactor-safe
 * ---
 * Laws:
 * 1. `Left identity`:
 *    of(a).flatMap(f) ≡ f(a)
 * 2. `Right identity`:
 *    fa.flatMap(of) ≡ fa
 * 3. `Associativity`:
 *    fa.flatMap(f).flatMap(g) ≡ fa.flatMap(x => f(x).flatMap(g))
 * ---
 * @param name Human-readable container name
 * @param of Factory method of container
 * @param make Factory method of sample container
 * @param flatMap Container implementation of flatMap operation
 * @param equals Structural equality check
 */
export function monadLawsAsync<F>(
  name: string,
  of: (n: number) => F,
  make: (n: number) => F,
  flatMap: (fa: F, f: (n: number) => F) => F,
  equals: (a: F, b: F) => Promise<boolean>,
) {
  describe(`${name} – Monad laws (async)`, () => {
    test('left identity', async () => {
      const f = (x: number) => make(x + 1);

      expect(await equals(flatMap(of(1), f), f(1))).toBe(true);
    });

    test('right identity', async () => {
      const fa = make(1);

      expect(await equals(flatMap(fa, of), fa)).toBe(true);
    });

    test('associativity', async () => {
      const fa = make(1);
      const f = (x: number) => make(x + 1);
      const g = (x: number) => make(x * 2);

      expect(
        await equals(
          flatMap(flatMap(fa, f), g),
          flatMap(fa, x => flatMap(f(x), g)),
        ),
      ).toBe(true);
    });
  });
}

/**
 * Verifies laws related to typed error propagation.
 * These laws are **DDD-critical**.
 * ---
 * Error-channel laws guarantee:
 * - failures short-circuit
 * - successes are not affected by error transforms
 * - errors are never swallowed
 * ---
 * @param name Human-readable container name
 * @param ok Factory method of success container
 * @param fail Factory method of failure container
 * @param map Container implementation of map operation
 * @param flatMap Container implementation of flatMap operation
 * @param mapError Container implementation of mapError operation
 * @param equals Structural equality check
 */
export function errorChannelLawsAsync<F>(
  name: string,
  ok: (n: number) => F,
  fail: (error: string) => F,
  map: (fa: F, f: (n: number) => number) => F,
  flatMap: (fa: F, f: (n: number) => F) => F,
  mapError: (fa: F, f: (error: string) => string) => F,
  equals: (a: F, b: F) => Promise<boolean>,
) {
  describe(`${name} – Error channel laws (async)`, () => {
    test('map does not affect failures', async () => {
      const fa = fail('err');

      expect(
        await equals(
          map(fa, x => x + 1),
          fa,
        ),
      ).toBe(true);
    });

    test('flatMap does not affect failures', async () => {
      const fa = fail('err');

      expect(await equals(flatMap(fa, ok), fa)).toBe(true);
    });

    test('mapError does not affect successes', async () => {
      const fa = ok(1);

      expect(
        await equals(
          mapError(fa, error => `x${error}`),
          fa,
        ),
      ).toBe(true);
    });
  });
}
