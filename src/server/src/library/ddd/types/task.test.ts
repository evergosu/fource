/* eslint-disable unicorn/no-array-callback-reference */
import {
  errorChannelLawsAsync,
  functorLawsAsync,
  monadLawsAsync,
} from './laws-async';
import { Result } from './result';
import { Task } from './task';

async function equals(
  a: Task<unknown, unknown>,
  b: Task<unknown, unknown>,
): Promise<boolean> {
  const ra = await a.run();
  const rb = await b.run();

  if (ra.isFailure && rb.isFailure) {
    return Object.is(ra.error, rb.error);
  }

  if (ra.isSuccess && rb.isSuccess) {
    return Object.is(ra.value, rb.value);
  }

  return false;
}

describe('Task', () => {
  it('should be liftable from Result', async () => {
    const task = Result.ok(42).toTask();
    const result = await task.run();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(42);
  });

  it('captures thrown errors as unknown', async () => {
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

  describe('Laws', () => {
    functorLawsAsync(
      'Task',
      n => Task.ok(n),
      (fa, f) => fa.map(f),
      (a, b) => equals(a, b),
    );

    monadLawsAsync(
      'Task',
      n => Task.ok(n),
      n => Task.ok(n),
      (fa, f) => fa.flatMap(f),
      (a, b) => equals(a, b),
    );

    errorChannelLawsAsync(
      'Task',
      n => Task.ok(n),
      error => Task.fail(error),
      (fa, f) => fa.map(f),
      (fa, f) => fa.flatMap(f),
      (fa, f) => fa.mapError(f),
      (a, b) => equals(a, b),
    );
  });
});
