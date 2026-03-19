import type { LawRuntime } from '../laws/law-runtime';

/**
 * ---
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
 * @param runtime Runtime required to evaluate laws
 * @param of Factory method of container
 * @param flatMap Container implementation of flatMap operation
 */
export function monadLaws<F, A>(runtime: LawRuntime<F, A>, of: (a: A) => F, flatMap: (fa: F, f: (a: A) => F) => F) {
  return {
    async leftIdentity(a: A, f: (a: A) => F) {
      const left = await runtime.run(flatMap(of(a), f));
      const right = await runtime.run(f(a));

      return runtime.equals(left, right);
    },

    async rightIdentity(fa: F) {
      const left = await runtime.run(flatMap(fa, of));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    async associativity(fa: F, f: (a: A) => F, g: (a: A) => F) {
      const left = await runtime.run(flatMap(flatMap(fa, f), g));

      const right = await runtime.run(flatMap(fa, a => flatMap(f(a), g)));

      return runtime.equals(left, right);
    },
  };
}
