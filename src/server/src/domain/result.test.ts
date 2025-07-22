import { Result } from './result';

describe('result', () => {
  const error = 'Something went wrong';

  describe('.isSuccess()', () => {
    const value = 'test value';

    it('should create a success result with value', () => {
      const result = Result.ok(value);

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getValue()).toBe(value);
    });

    it('should create a success result without value (void)', () => {
      const result = Result.ok();

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(result.getValue()).toBeUndefined();
    });

    it('should throw when accessing error on success result', () => {
      const result = Result.ok(value);

      expect(() => result.getError()).toThrowError(
        'InvalidResult: Cannot get the error of a successful result',
      );
    });
  });

  describe('.isFailure()', () => {
    it('should create a failure result with string error', () => {
      const result = Result.fail(error);

      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(error);
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
      expect(result.getError()).toEqual(error);
    });

    it('should throw when accessing value on failure result', () => {
      const result = Result.fail(error);

      expect(() => result.getValue()).toThrowError(
        'InvalidResult: Cannot get the value of a failed result',
      );
    });
  });

  describe('.combine()', () => {
    it('should return ok if all results succeed', () => {
      const resultOne = Result.ok(42);
      const resultTwo = Result.ok('foo');
      const resultThree = Result.ok();

      const combined = Result.combine([resultOne, resultTwo, resultThree]);

      expect(combined.isSuccess).toBe(true);
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
      expect(combined.getError()).toBe('Failed at step 2');
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
});
