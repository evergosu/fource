import { DataTypeInvariantViolationException } from './adt-error';
import { Result } from './result';

describe('result', () => {
  const error = 'Something went wrong';

  describe('.isSuccess()', () => {
    const value = 'test value';

    it('should create a success result with value', () => {
      const result = Result.ok(value);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(value);
    });

    it('should create a success result without value (void)', () => {
      const result = Result.ok();

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);

      expect(result.value).toBeUndefined();
    });

    it('should throw when accessing error on success result', () => {
      const result = Result.ok(value);

      expect(() => result.error).toThrowError(
        DataTypeInvariantViolationException,
      );
    });
  });

  describe('.isFailure()', () => {
    it('should create a failure result with string error', () => {
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });

    it('should create a failure result with custom error type', () => {
      interface DomainError {
        message: string;
        code: string;
      }

      const error: DomainError = {
        message: 'Validation failed',
        code: 'ERR001',
      };

      const result = Result.fail<never, DomainError>(error);

      expect(result.isFailure).toBe(true);
      expect(result.error).toEqual(error);
    });

    it('should throw when accessing value on failure result', () => {
      const result = Result.fail(error);

      expect(() => result.value).toThrowError(
        DataTypeInvariantViolationException,
      );
    });
  });

  describe('.getOrElse()', () => {
    const value = 'test value';

    it('should return value on successful result', () => {
      const result = Result.ok(value);

      expect(result.isSuccess).toBe(true);
      expect(result.getOrElse('foo')).toBe(value);
    });

    it('should return fallback on failed result', () => {
      const result = Result.fail(value);

      expect(result.isFailure).toBe(true);
      expect(result.getOrElse('foo' as never)).toBe('foo');
    });
  });

  describe('.getOrElseLazy()', () => {
    const value = 'test value';

    it('should return value on successful result', () => {
      const result = Result.ok(value);

      expect(result.isSuccess).toBe(true);
      expect(result.getOrElseLazy(() => 'foo')).toBe(value);
    });

    it('should return fallback on failed result', () => {
      const result = Result.fail(value);

      expect(result.isFailure).toBe(true);
      expect(result.getOrElseLazy((() => 'foo') as never)).toBe('foo');
    });
  });

  describe('.combine()', () => {
    it('should return ok if all results succeed', () => {
      const resultOne = Result.ok(42);
      const resultTwo = Result.ok('foo');
      const resultThree = Result.ok();

      const combined = Result.combine([resultOne, resultTwo, resultThree]);

      expect(combined.isSuccess).toBe(true);

      expect(combined.value).toBe(undefined);
    });

    it('should return first failure if any result fails', () => {
      const resultOne = Result.ok('bar');
      const resultTwo = Result.fail('Failed at step 2');
      const resultThree = Result.ok('baz');
      const resultFour = Result.fail('Failed at step 4');

      const combined = Result.combine([
        resultOne,
        resultTwo,
        resultThree,
        resultFour,
      ]);

      expect(combined.isFailure).toBe(true);
      expect(combined.error).toBe('Failed at step 2');
    });
  });

  describe('.fromThrowable()', () => {
    it('should wrap try-catch correctly on success', () => {
      const result = Result.fromThrowable(
        () => 42,
        error => (error as Error).message,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should wrap try-catch correctly on error', () => {
      const error = 'something went wrong';

      const result = Result.fromThrowable(
        () => {
          throw new Error(error);
        },
        error => (error as Error).message,
      );

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('.fold()', () => {
    it('should fold success value correctly', () => {
      const result = Result.ok(7).fold(
        () => 'failed',
        value => `success: ${value.toString()}`,
      );

      expect(result).toBe('success: 7');
    });

    it('should fold error value correctly', () => {
      const result = Result.fail('oops').fold(
        error => `error: ${error}`,
        () => 'success',
      );

      expect(result).toBe('error: oops');
    });
  });

  describe('.map()', () => {
    it('should transform value if success', () => {
      const result = Result.ok(2);

      const mapped = result.map(n => n * 3);

      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(6);
    });

    it('should return same failure if result is failure', () => {
      const result = Result.fail('error');

      const mapped = result.map((n: number) => n * 3);

      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('error');
    });
  });

  describe('.mapError()', () => {
    it('should mapError correctly', () => {
      const left = Result.fail('fail').mapError(error => error.toUpperCase());

      expect(left.isFailure).toBe(true);
      expect(left.error).toBe('FAIL');
    });

    it('should not map success value', () => {
      const right = Result.ok(14).mapError(x => x * 3);

      expect(right.isSuccess).toBe(true);
      expect(right.value).toBe(14);
    });
  });

  describe('.flatMap()', () => {
    it('should transform to new result if success', () => {
      const result = Result.ok(2);

      const flatMapped = result.flatMap(n => Result.ok(n * 5));

      expect(flatMapped.isSuccess).toBe(true);
      expect(flatMapped.value).toBe(10);
    });

    it('should return same failure if result is failure', () => {
      const result = Result.fail('fail');

      const flatMapped = result.flatMap((n: number) => Result.ok(n * 5));

      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe('fail');
    });

    it('should propagate failure from inner result', () => {
      const result: Result<number, string> = Result.ok(2);

      const flatMapped = result.flatMap(() => Result.fail('inner fail'));

      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe('inner fail');
    });
  });

  describe('.mapAsync()', () => {
    it('should asynchronously transform value if success', async () => {
      const result = Result.ok(3);

      const mapped = await result.mapAsync(
        async n => await Promise.resolve(n + 7),
      );

      expect(mapped.isSuccess).toBe(true);
      expect(mapped.value).toBe(10);
    });

    it('should return same failure if result is failure', async () => {
      const result = Result.fail('async error');

      const mapped = await result.mapAsync(
        async (n: number) => await Promise.resolve(n + 1),
      );

      expect(mapped.isFailure).toBe(true);
      expect(mapped.error).toBe('async error');
    });
  });

  describe('.flatMapAsync()', () => {
    it('should asynchronously transform value into a result if success', async () => {
      const result = Result.ok(4);

      const flatMapped = await result.flatMapAsync(
        async n => await Promise.resolve(Result.ok(n * 2)),
      );

      expect(flatMapped.isSuccess).toBe(true);
      expect(flatMapped.value).toBe(8);
    });

    it('should return same failure if result is failure', async () => {
      const result = Result.fail('initial failure');
      const flatMapped = await result.flatMapAsync(
        async (n: number) => await Promise.resolve(Result.ok(n * 2)),
      );

      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe('initial failure');
    });

    it('should propagate inner async failure result', async () => {
      const result: Result<number, string> = Result.ok(100);

      const flatMapped = await result.flatMapAsync(
        async () => await Promise.resolve(Result.fail('inner failure')),
      );

      expect(flatMapped.isFailure).toBe(true);
      expect(flatMapped.error).toBe('inner failure');
    });
  });

  describe('.toString()', () => {
    it('should serialize success value', () => {
      const result = Result.ok(42);

      expect(result.toString()).toBe('Success(42)');
    });

    it('should serialize error', () => {
      const result = Result.fail(42);

      expect(result.toString()).toBe('Failure(42)');
    });
  });
});
