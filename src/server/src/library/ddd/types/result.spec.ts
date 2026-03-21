import type { LawRuntime } from './laws/law-runtime';

import { eliminatorLaws } from './laws/eliminator-laws';
import { bifunctorLaws } from './laws/bifunctor-laws';

/* eslint-disable unicorn/consistent-function-scoping */
import { naturalTransformationLaws } from './laws/natural-transformation-laws';
import { applicativeLawsResult } from './laws/applicative-laws-result';
import { monadMorphismLaws } from './laws/monad-morphism-laws';
import { errorChannelLaws } from './laws/error-channel-laws';
import { functorLaws } from './laws/functor-laws';
import { createTaskRuntime } from './task.spec';
import { monadLaws } from './laws/monad-laws';
import { Result } from './result';
import { Task } from './task';

function createResultRuntime<A, E>(): LawRuntime<Result<A, E>, A, E> {
  return {
    run(fa) {
      return Promise.resolve(fa);
    },

    equals(left, right) {
      if (left.isSuccess() && right.isSuccess()) {
        return left.value === right.value;
      }

      if (left.isFailure() && right.isFailure()) {
        return left.error === right.error;
      }

      return false;
    },
  };
}

describe('category theory', () => {
  describe('functor laws', () => {
    const laws = functorLaws<Result<number, never>, number, never>(
      createResultRuntime<number, never>(),
      Result.ok(42),
      (fa, f) => fa.map(x => f(x)),
    );

    it('should satisfy identity', async () => {
      expect(await laws.identity()).toBe(true);
    });

    it('should satisfy composition', async () => {
      const f = (n: number) => n + 1;
      const g = (n: number) => n * 2;

      expect(await laws.composition(f, g)).toBe(true);
    });
  });

  describe('bifunctor laws', () => {
    it('should satisfy identity', async () => {
      const laws = bifunctorLaws(createResultRuntime<number, string>(), Result.ok(42), (fa, f, g) => fa.bimap(f, g));

      expect(await laws.identity()).toBe(true);
    });

    it('should satisfy composition on success', async () => {
      const laws = bifunctorLaws(createResultRuntime<number, string>(), Result.ok(10), (fa, f, g) => fa.bimap(f, g));

      expect(
        await laws.composition(
          n => n + 1,
          n => n * 2,
          error => `${error}!`,
          error => error.toUpperCase(),
        ),
      ).toBe(true);
    });

    it('should satisfy composition on failure', async () => {
      const laws = bifunctorLaws(createResultRuntime<number, string>(), Result.fail('err'), (fa, f, g) =>
        fa.bimap(f, g),
      );

      expect(
        await laws.composition(
          n => n + 1,
          n => n * 2,
          error => `${error}!`,
          error => error.toUpperCase(),
        ),
      ).toBe(true);
    });
  });

  describe('applicative laws', () => {
    const runtime = createResultRuntime<number, string>();

    const laws = applicativeLawsResult<number, number, number, string>(
      runtime,
      n => Result.ok(n),
      (ff, fa) => ff.ap(fa),
      Result.ok(4),
    );

    it('should satisfy identity', async () => {
      expect(await laws.identity()).toBe(true);
    });

    it('should satisfy homomorphism', async () => {
      expect(await laws.homomorphism(x => x + 1, 2)).toBe(true);
    });

    it('should satisfy interchange', async () => {
      expect(
        await laws.interchange(
          Result.ok((x: number) => x * 2),
          3,
        ),
      ).toBe(true);
    });

    it('should satisfy composition', async () => {
      const fg = Result.ok((x: number) => x + 1);
      const ff = Result.ok((x: number) => x * 2);

      expect(await laws.composition(fg, ff)).toBe(true);
    });
  });

  describe('monad laws', () => {
    const laws = monadLaws<Result<number, string>, number>(
      createResultRuntime<number, never>(),
      n => Result.ok(n),
      (fa, f) => fa.flatMap(x => f(x)),
    );

    it('should satisfy left identity', async () => {
      const f = (n: number) => Result.ok(n + 1);

      expect(await laws.leftIdentity(1, f)).toBe(true);
    });

    it('should satisfy right identity on success', async () => {
      const fa = Result.ok(5);

      expect(await laws.rightIdentity(fa)).toBe(true);
    });

    it('should satisfy right identity on failure', async () => {
      const fa = Result.fail('fail');

      expect(await laws.rightIdentity(fa)).toBe(true);
    });

    it('should satisfy associativity', async () => {
      const fa = Result.ok(5);

      const f = (n: number) => Result.ok(n + 1);
      const g = (n: number) => Result.ok(n * 2);

      expect(await laws.associativity(fa, f, g)).toBe(true);
    });
  });

  describe('error-channel laws', () => {
    const laws = errorChannelLaws<Result<number, string>, number, string>(
      (fa, f) => fa.mapError(x => f(x)),
      (fa, f) => fa.flatMap(x => f(x)),
      (fa, f) => fa.map(x => f(x)),
      error => Result.fail(error),
      value => Result.ok(value),
      createResultRuntime<number, never>(),
    );

    it('should not affect failure on map operations', async () => {
      expect(await laws.mapDoesNotAffectFailure()).toBe(true);
    });

    it('should not affect failure on flatMap operations', async () => {
      expect(await laws.flatMapDoesNotAffectFailure()).toBe(true);
    });

    it('should not affect success on mapError operations', async () => {
      expect(await laws.mapErrorDoesNotAffectSuccess()).toBe(true);
    });

    it('should respect functor identity on mapError operations', async () => {
      expect(await laws.mapErrorFunctorIdentity()).toBe(true);
    });

    it('should respect functor composition on mapError operations', async () => {
      expect(await laws.mapErrorFunctorComposition()).toBe(true);
    });
  });

  describe('natural transformation laws', () => {
    const runtimeTask = createTaskRuntime<number, string>();

    const mapResult = <A, B>(fa: Result<A, string>, f: (a: A) => B) => fa.map(x => f(x));

    const mapTask = <A, B>(fa: Task<A, string>, f: (a: A) => B) => fa.map(x => f(x));

    const lift = <A>(fa: Result<A, string>): Task<A, string> => Task.fromResult(fa);

    it('should satisfy naturality on success', async () => {
      const laws = naturalTransformationLaws(
        runtimeTask,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        Result.ok(1) as Result<number, string>,
        mapResult,
        mapTask,
        lift,
      );

      expect(await laws.naturality(x => x + 1)).toBe(true);
    });

    it('should satisfy naturality on failure', async () => {
      const laws = naturalTransformationLaws(
        runtimeTask,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        Result.fail('err') as Result<number, string>,
        mapResult,
        mapTask,
        lift,
      );

      expect(await laws.naturality(x => x + 1)).toBe(true);
    });
  });

  describe('monad morphism laws', () => {
    const runtime = createTaskRuntime<number, string>();

    const ofResult = <A>(a: A): Result<A, string> => Result.ok(a);

    const ofTask = <A>(a: A): Task<A, string> => Task.ok(a);

    const flatMapResult = <A, B>(fa: Result<A, string>, f: (a: A) => Result<B, string>) => fa.flatMap(x => f(x));

    const flatMapTask = <A, B>(fa: Task<A, string>, f: (a: A) => Task<B, string>) => fa.flatMap(x => f(x));

    const lift = <A>(fa: Result<A, string>) => Task.fromResult(fa);

    it('should preserve of', async () => {
      const laws = monadMorphismLaws(runtime, ofResult, ofTask, flatMapResult, flatMapTask, lift);

      expect(await laws.preserveOf(1)).toBe(true);
    });

    it('should preserve flatMap', async () => {
      const laws = monadMorphismLaws(runtime, ofResult, ofTask, flatMapResult, flatMapTask, lift);

      const fa = Result.ok(1);
      const f = (n: number) => Result.ok(n + 1);

      expect(await laws.preserveFlatMap(fa, f)).toBe(true);
    });
  });

  describe('eliminator laws', () => {
    it('should satisfy left consistency', () => {
      const fa = Result.fail<string>('err');

      const laws = eliminatorLaws(fa, (r, fail, ok) => r.match({ fail, ok }));

      expect(
        laws.leftConsistency(
          'err',
          error => `error:${String(error)}`,
          n => `ok:${String(n)}`,
        ),
      ).toBe(true);
    });

    it('should satisfy right consistency', () => {
      const fa = Result.ok<number>(5);

      const laws = eliminatorLaws(fa, (r, fail, ok) => r.match({ fail, ok }));

      expect(
        laws.rightConsistency(
          5,
          error => `error:${String(error)}`,
          n => `ok:${String(n)}`,
        ),
      ).toBe(true);
    });

    it('should satisfy naturality', () => {
      const fa = Result.ok<number>(3);

      const laws = eliminatorLaws<typeof fa, number, string, number>(fa, (r, fail, ok) => r.match({ fail, ok }));

      expect(
        laws.naturality(
          error => error.length,
          n => n + 1,
          x => x * 2,
        ),
      ).toBe(true);
    });
  });
});
