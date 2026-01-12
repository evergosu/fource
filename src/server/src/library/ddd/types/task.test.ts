/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable unicorn/no-array-callback-reference */

import type { LawRuntime } from './laws/law-runtime';

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

describe('Task', () => {
  it('should be liftable from Result', async () => {
    const task = Result.ok(42).toTask();
    const result = await task.run();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(42);
  });

  it('should capture thrown errors as unknown', async () => {
    const task = Task.fromPromise(() => {
      throw new Error('boom');
    });

    const result = await task.run();

    expect(result.isFailure).toBe(true);
  });

  describe('.run()', () => {
    it('should be lazy', async () => {
      const function_ = vi.fn(() => Promise.resolve(1));

      const task = Task.fromPromise(function_);

      expect(function_).not.toHaveBeenCalled();

      await task.run();

      expect(function_).toHaveBeenCalledOnce();
    });
  });

  describe('.ok()', () => {
    it('should produce success', async () => {
      const result = await Task.ok(1).run();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(1);
    });
  });

  describe('.fail()', () => {
    it('should produce failure', async () => {
      const result = await Task.fail('err').run();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('err');
    });
  });

  describe('.map()', () => {
    test('should transform success', async () => {
      const result = await Task.ok(1)
        .map(x => x + 1)
        .run();

      expect(result.value).toBe(2);
    });

    test('should not run on failure', async () => {
      const function_ = vi.fn();

      await Task.fail('err')
        .map(() => {
          function_();
        })
        .run();

      expect(function_).not.toHaveBeenCalled();
    });
  });

  describe('.flatMap()', () => {
    it('should sequence tasks', async () => {
      const result = await Task.ok(2)
        .flatMap(n => Task.ok(n + 1))
        .run();

      expect(result.value).toBe(3);
    });

    it('should short-circuit on failure', async () => {
      const result = await Task.fail<string>('error')
        .flatMap(() => Task.ok(1))
        .run();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('error');
    });
  });

  describe('.ensure()', () => {
    it('should succeed when predicate is true', async () => {
      const result = await Task.ok(1)
        .ensure(x => x === 1, 'fail')
        .run();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(1);
    });

    it('should fail when predicate is false', async () => {
      const result = await Task.ok(1)
        .ensure(x => x > 2, 'fail')
        .run();

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('fail');
    });
  });

  describe('.all()', () => {
    test('should run sequentially', async () => {
      const result = await Task.all([Task.ok(1), Task.ok(2)]).run();

      expect(result.value).toEqual([1, 2]);
    });
  });

  describe('functor laws', () => {
    const laws = functorLaws<Task<number, never>, number, never>(
      createTaskRuntime<number, never>(),
      Task.ok<number>(42),
      (fa, f) => fa.map(f),
    );

    test('should follow identity', async () => {
      expect(await laws.identity()).toBe(true);
    });

    test('should follow composition', async () => {
      const f = (n: number) => n + 1;
      const g = (n: number) => n * 2;

      expect(await laws.composition(f, g)).toBe(true);
    });
  });

  describe('monad laws', () => {
    const laws = monadLaws<Task<number, never>, number>(
      createTaskRuntime<number, never>(),
      n => Task.ok<number>(n),
      (fa, f) => fa.flatMap(f),
    );

    test('should follow left identity', async () => {
      const f = (n: number) => Task.ok(n + 1);

      expect(await laws.leftIdentity(1, f)).toBe(true);
    });

    test('should follow right identity', async () => {
      const fa = Task.ok(5);

      expect(await laws.rightIdentity(fa)).toBe(true);
    });

    test('should follow associativity', async () => {
      const fa = Task.ok(5);

      const f = (n: number) => Task.ok(n + 1);
      const g = (n: number) => Task.ok(n * 2);

      expect(await laws.associativity(fa, f, g)).toBe(true);
    });
  });

  describe('error-channel laws', () => {
    const laws = errorChannelLaws<Task<number, string>, number, string>(
      (fa, f) => fa.mapError(f),
      (fa, f) => fa.flatMap(f),
      (fa, f) => fa.map(f),
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
