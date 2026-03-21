/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import type { LawRuntime } from './law-runtime';
import type { Result } from '../../primitives';

export interface Apply<F, A = unknown> {
  ap<B>(fa: Apply<F, A>): Apply<F, B>;
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
export function applicativeLawsResult<A, B, C, E>(
  runtime: LawRuntime<Result<unknown, E>, unknown, E>,
  of: <T>(value: T) => Result<T, E>,
  ap: <X, Y>(ff: Result<(x: X) => Y, E>, fa: Result<X, E>) => Result<Y, E>,
  fa: Result<A, E>,
) {
  const compose = (f: (b: B) => C) => (g: (a: A) => B) => (a: A) => f(g(a));

  return {
    async identity() {
      const left = await runtime.run(
        ap(
          of((x: A) => x),
          fa,
        ),
      );

      const right = await runtime.run(fa);

      return runtime.equals(left, right);
    },

    async homomorphism(f: (a: A) => B, a: A) {
      const left = await runtime.run(ap(of(f), of(a)));
      const right = await runtime.run(of(f(a)));

      return runtime.equals(left, right);
    },

    async interchange(ff: Result<(a: A) => B, E>, a: A) {
      const left = await runtime.run(ap(ff, of(a)));

      const right = await runtime.run(
        ap(
          of((f: (a: A) => B) => f(a)),
          ff,
        ),
      );

      return runtime.equals(left, right);
    },

    async composition(fg: Result<(b: B) => C, E>, ff: Result<(a: A) => B, E>) {
      const left = await runtime.run(ap(ap(ap(of(compose), fg), ff), fa));

      const right = await runtime.run(ap(fg, ap(ff, fa)));

      return runtime.equals(left, right);
    },
  };
}
