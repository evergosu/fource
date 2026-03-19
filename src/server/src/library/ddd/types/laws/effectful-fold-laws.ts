import type { LawRuntime } from './law-runtime';

/**
 * ---
 * Verifies laws for effectful folds.
 * ---
 * An effectful fold:
 * - consumes a container
 * - but preserves the effect
 * - returning F<R> instead of R
 *
 * This applies to Task / IO / Effect.
 * ---
 * @param runtime Runtime required to evaluate laws
 * @param fa Container under tests
 * @param match Container implementation of match operation
 */
export function effectfulFoldLaws<F, A, E, R>(
  runtime: LawRuntime<F, R, E>,
  fa: F,
  match: (fa: F, fail: (error: E) => R, ok: (value: A) => R) => F,
) {
  return {
    async leftConsistency(_error: E, f: (error: E) => R, g: (value: A) => R) {
      const folded = await runtime.run(match(fa, f, g));
      const expected = await runtime.run(match(fa, f, g));

      return runtime.equals(folded, expected);
    },

    async rightConsistency(_value: A, f: (error: E) => R, g: (value: A) => R) {
      const folded = await runtime.run(match(fa, f, g));
      const expected = await runtime.run(match(fa, f, g));

      return runtime.equals(folded, expected);
    },

    async naturality(f: (error: E) => R, g: (value: A) => R, h: (r: R) => R, map: (fa: F, f: (r: R) => R) => F) {
      const left = await runtime.run(map(match(fa, f, g), h));

      const right = await runtime.run(
        match(
          fa,
          error => h(f(error)),
          value => h(g(value)),
        ),
      );

      return runtime.equals(left, right);
    },
  };
}
