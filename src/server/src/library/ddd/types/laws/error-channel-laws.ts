import type { LawRuntime } from '../laws/law-runtime';

import { functorLaws } from './functor-laws';

/**
 * ---
 * Error-channel absorption laws.
 * ---
 * These laws assert that once a computation is in the error channel:
 * - `map` does not affect it
 * - `flatMap` does not affect it
 * - `mapError` does not affect successes
 * ---
 * @param mapError Container implementation of mapError operation
 * @param flatMap Container implementation of flatMap operation
 * @param map Container implementation of map operation
 * @param fail Factory method of failure container
 * @param ok Factory method of success container
 * @param runtime Runtime required to evaluate laws
 */
export function errorChannelLaws<F, A, E>(
  mapError: (fa: F, f: (error: E) => E) => F,
  flatMap: (fa: F, f: (a: A) => F) => F,
  map: (fa: F, f: (a: A) => A) => F,
  fail: (error: E) => F,
  ok: (a: A) => F,
  runtime: LawRuntime<F, A, E>,
) {
  return {
    mapDoesNotAffectFailure: async () => {
      const fa = fail({} as E);

      const left = await runtime.run(map(fa, x => x));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    flatMapDoesNotAffectFailure: async () => {
      const fa = fail({} as E);

      const left = await runtime.run(flatMap(fa, ok));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    mapErrorDoesNotAffectSuccess: async () => {
      const fa = ok({} as A);

      const left = await runtime.run(mapError(fa, error => error));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    mapErrorFunctorComposition: async () => {
      const fa = fail({} as E);

      const f = (error: E) => error;
      const g = (error: E) => error;

      return await functorLaws(
        // Reinterpret the runtime as running over E.
        runtime as unknown as LawRuntime<F, E, E>,
        fa,
        mapError,
      ).composition(f, g);
    },

    mapErrorFunctorIdentity: async () => {
      const fa = fail({} as E);

      return await functorLaws(
        // Reinterpret the runtime as running over E.
        runtime as unknown as LawRuntime<F, E, E>,
        fa,
        mapError,
      ).identity();
    },
  };
}
