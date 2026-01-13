import type { LawRuntime } from './laws/law-runtime';

/* eslint-disable unicorn/consistent-function-scoping */
import { naturalTransformationLaws } from './laws/natural-transformation-laws';
import { monadMorphismLaws } from './laws/monad-morphism-laws';
import { errorChannelLaws } from './laws/error-channel-laws';
import { functorLaws } from './laws/functor-laws';
import { monadLaws } from './laws/monad-laws';
import { Result } from './result';
import { Task } from './task';

function createTaskRuntime<A, E>(): LawRuntime<Task<A, E>, A, E> {
  return {
    async run(fa) {
      return fa.run();
    },

    equals(left, right) {
      if (left.isSuccess && right.isSuccess) {
        return left.value === right.value;
      }

      if (left.isFailure && right.isFailure) {
        return left.error === right.error;
      }

      return false;
    },
  };
}

describe('category theory', () => {
  describe('functor laws', () => {
    const laws = functorLaws<Task<number, never>, number, never>(
      createTaskRuntime<number, never>(),
      Task.ok<number>(42),
      (fa, f) => fa.map(x => f(x)),
    );

    it('should follow identity', async () => {
      expect(await laws.identity()).toBe(true);
    });

    it('should follow composition', async () => {
      const f = (n: number) => n + 1;
      const g = (n: number) => n * 2;

      expect(await laws.composition(f, g)).toBe(true);
    });
  });

  describe('natural transformation laws', () => {
    const runtimeTask = createTaskRuntime<number, string>();

    const mapResult = <A, B>(fa: Result<A, string>, f: (a: A) => B) =>
      fa.map(x => f(x));

    const mapTask = <A, B>(fa: Task<A, string>, f: (a: A) => B) =>
      fa.map(x => f(x));

    const lift = <A>(fa: Result<A, string>): Task<A, string> =>
      Task.fromResult(fa);

    it('should follow naturality on success', async () => {
      const laws = naturalTransformationLaws(
        runtimeTask,
        Result.ok(1) as Result<number, string>,
        mapResult,
        mapTask,
        lift,
      );

      expect(await laws.naturality(x => x + 1)).toBe(true);
    });

    it('should follow naturality on failure', async () => {
      const laws = naturalTransformationLaws(
        runtimeTask,
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

    const flatMapResult = <A, B>(
      fa: Result<A, string>,
      f: (a: A) => Result<B, string>,
    ) => fa.flatMap(x => f(x));

    const flatMapTask = <A, B>(
      fa: Task<A, string>,
      f: (a: A) => Task<B, string>,
    ) => fa.flatMap(x => f(x));

    const lift = <A>(fa: Result<A, string>) => Task.fromResult(fa);

    it('should preserve of', async () => {
      const laws = monadMorphismLaws(
        runtime,
        ofResult,
        ofTask,
        flatMapResult,
        flatMapTask,
        lift,
      );

      expect(await laws.preserveOf(1)).toBe(true);
    });

    it('should preserve flatMap', async () => {
      const laws = monadMorphismLaws(
        runtime,
        ofResult,
        ofTask,
        flatMapResult,
        flatMapTask,
        lift,
      );

      const fa = Result.ok(1);
      const f = (n: number) => Result.ok(n + 1);

      expect(await laws.preserveFlatMap(fa, f)).toBe(true);
    });
  });

  describe('monad laws', () => {
    const laws = monadLaws<Task<number, never>, number>(
      createTaskRuntime<number, never>(),
      n => Task.ok<number>(n),
      (fa, f) => fa.flatMap(x => f(x)),
    );

    it('should follow left identity', async () => {
      const f = (n: number) => Task.ok(n + 1);

      expect(await laws.leftIdentity(1, f)).toBe(true);
    });

    it('should follow right identity', async () => {
      const fa = Task.ok(5);

      expect(await laws.rightIdentity(fa)).toBe(true);
    });

    it('should follow associativity', async () => {
      const fa = Task.ok(5);

      const f = (n: number) => Task.ok(n + 1);
      const g = (n: number) => Task.ok(n * 2);

      expect(await laws.associativity(fa, f, g)).toBe(true);
    });
  });

  describe('error-channel laws', () => {
    const laws = errorChannelLaws<Task<number, string>, number, string>(
      (fa, f) => fa.mapError(x => f(x)),
      (fa, f) => fa.flatMap(x => f(x)),
      (fa, f) => fa.map(x => f(x)),
      error => Task.fail(error),
      value => Task.ok(value),
      createTaskRuntime<number, never>(),
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
});
