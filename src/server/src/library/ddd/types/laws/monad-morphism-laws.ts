import type { LawRuntime } from './law-runtime';

/**
 * ---
 * Laws for a monad morphism.
 * ---
 * η : M<A> → N<A>
 * ---
 * @param runtimeN Runtime required to evaluate laws at lifted state
 * @param ofM Factory method of M container
 * @param ofN Factory method of N container
 * @param flatMapM Implementation of flatMap operation on M container
 * @param flatMapN Implementation of flatMap operation on N container
 * @param lift Implementation of lift operation on N container
 */
export function monadMorphismLaws<M, N, A, E>(
  runtimeN: LawRuntime<N, A, E>,
  ofM: (a: A) => M,
  ofN: (a: A) => N,
  flatMapM: (ma: M, f: (a: A) => M) => M,
  flatMapN: (na: N, f: (a: A) => N) => N,
  lift: (ma: M) => N,
) {
  return {
    preserveOf: async (a: A) => {
      const left = await runtimeN.run(lift(ofM(a)));
      const right = await runtimeN.run(ofN(a));

      return runtimeN.equals(left, right);
    },

    preserveFlatMap: async (ma: M, f: (a: A) => M) => {
      const left = await runtimeN.run(lift(flatMapM(ma, f)));

      const right = await runtimeN.run(flatMapN(lift(ma), a => lift(f(a))));

      return runtimeN.equals(left, right);
    },
  };
}
