import type { LawRuntime } from './law-runtime';

/**
 * ---
 * Laws for a natural transformation between two functors.
 * ---
 * η : F<A> → G<A>
   η(mapF(f)(fa)) === mapG(f)(η(fa))
 * ---
 * @param runtimeG Runtime required to evaluate laws at lifted state
 * @param fa Container under tests
 * @param mapF Implementation of map operation on F container
 * @param mapG Implementation of map operation on G container
 * @param lift Implementation of lift operation on G container
 */
export function naturalTransformationLaws<F, G, A, E>(
  runtimeG: LawRuntime<G, A, E>,
  fa: F,
  mapF: (fa: F, f: (a: A) => A) => F,
  mapG: (ga: G, f: (a: A) => A) => G,
  lift: (fa: F) => G,
) {
  return {
    async naturality(f: (a: A) => A) {
      const left = await runtimeG.run(lift(mapF(fa, f)));

      const right = await runtimeG.run(mapG(lift(fa), f));

      return runtimeG.equals(left, right);
    },
  };
}
