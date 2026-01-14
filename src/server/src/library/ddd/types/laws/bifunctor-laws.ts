import type { LawRuntime } from './law-runtime';

/**
 * ---
 * Verifies Bifunctor laws for containers supporting `bimap`.
 * ---
 * A bifunctor allows mapping over two independent type parameters.
 * ---
 * Laws:
 * 1. `Identity`:
 *    fa.bimap(id, id) ≡ fa
 * 2. `Composition`:
 *    fa.bimap(f1, g1).bimap(f2, g2)
 *    ≡
 *    fa.bimap(x => f2(f1(x)), e => g2(g1(e)))
 * ---
 * @param runtime Runtime required to evaluate laws
 * @param fa Container under tests
 * @param bimap Container implementation of bimap operation
 */
export function bifunctorLaws<F, A, E>(
  runtime: LawRuntime<F, A, E>,
  fa: F,
  bimap: (fa: F, mapValue: (a: A) => A, mapError: (error: E) => E) => F,
) {
  return {
    async identity() {
      const left = await runtime.run(
        bimap(
          fa,
          a => a,
          error => error,
        ),
      );

      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    async composition(
      f1: (a: A) => A,
      f2: (a: A) => A,
      g1: (error: E) => E,
      g2: (error: E) => E,
    ) {
      const left = await runtime.run(bimap(bimap(fa, f1, g1), f2, g2));

      const right = await runtime.run(
        bimap(
          fa,
          a => f2(f1(a)),
          error => g2(g1(error)),
        ),
      );

      return runtime.equals(left, right);
    },
  };
}
