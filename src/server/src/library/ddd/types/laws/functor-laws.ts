import type { LawRuntime } from '../laws/law-runtime';

/**
 * ---
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
 * @param runtime Runtime required to evaluate laws
 * @param fa Container under tests
 * @param map Container implementation of map operation
 */
export function functorLaws<F, A, E>(
  runtime: LawRuntime<F, A, E>,
  fa: F,
  map: (fa: F, f: (a: A) => A) => F,
) {
  return {
    async identity() {
      const left = await runtime.run(map(fa, a => a));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    async composition(f: (a: A) => A, g: (a: A) => A) {
      const left = await runtime.run(map(map(fa, f), g));

      const right = await runtime.run(map(fa, a => g(f(a))));

      return runtime.equals(left, right);
    },
  };
}
