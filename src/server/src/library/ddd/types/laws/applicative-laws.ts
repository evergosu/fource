/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */

import type { LawRuntime } from './law-runtime';

import { identity } from '../identity';

export interface Apply<F> {
  ap(fa: F): F;
}

/**
 * ---
 * Verifies Applicative laws for containers supporting `ap`.
 * ---
 * An applicative allows applying a function inside a container to
 * a value inside a container, without sequencing.
 * ---
 * Laws:
 * 1. `Identity`:
 *    of(x => x).ap(fa) ≡ fa
 * 2. `Homomorphism`
 *    of(f).ap(of(x)) ≡ of(f(x))
 * 3. `Interchange`:
 *    ff.ap(of(x)) ≡ of(f => f(x)).ap(ff)
 * 4. `Composition`:
 *    of(compose).ap(fg).ap(ff).ap(fa) ≡ fg.ap(ff.ap(fa))
 * ---
 * @param runtime Runtime required to evaluate laws
 * @param of Factory method of container
 * @param ap Container implementation of ap operation
 * @param fa Container under tests
 */
export function applicativeLaws<A, B, C, E, F extends Apply<F>>(
  runtime: LawRuntime<F, unknown, E>,
  of: <T>(value: T) => F,
  // @ts-expect-error allowed intentionally to support applicative parametrism.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, prettier/prettier
  ap: <X, Y>(ff: { ap(fa: F): F; } & F, fa: F) => F,
  fa: F,
) {
  const compose = (f: (b: B) => C) => (g: (a: A) => B) => (a: A) => f(g(a));

  return {
    async identity() {
      const left = await runtime.run(ap(of(identity), fa));
      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    async homomorphism(f: (a: A) => B, a: A) {
      const left = await runtime.run(ap(of(f), of(a)));
      const right = await runtime.run(of(f(a)));

      return runtime.equals(left, right);
    },

    async interchange(ff: F, a: A) {
      const left = await runtime.run(ap(ff, of(a)));

      const right = await runtime.run(
        ap(
          of((f: (a: A) => B) => f(a)),
          ff,
        ),
      );

      return runtime.equals(left, right);
    },

    async composition(fg: F, ff: F) {
      const left = await runtime.run(ap(ap(ap(of(compose), fg), ff), fa));

      const right = await runtime.run(ap(fg, ap(ff, fa)));

      return runtime.equals(left, right);
    },
  };
}
