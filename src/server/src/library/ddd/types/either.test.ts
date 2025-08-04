import { DataTypeInvariantViolationException } from './type-error';
import { Either } from './either';

describe('either', () => {
  describe('.right()', () => {
    it('should create Right either with value', () => {
      const right = Either.right(42);

      expect(right.isRight()).toBe(true);
      expect(right.getRight()).toBe(42);
    });

    it('should create Right either without value (void)', () => {
      const right = Either.right();

      expect(right.isRight()).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(right.getRight()).toBeUndefined();
    });

    it('should throw when accessing Left on Right either', () => {
      const right = Either.right(42);

      expect(() => right.getLeft()).toThrowError(
        DataTypeInvariantViolationException,
      );
    });
  });

  describe('.left()', () => {
    it('should create Left either with value', () => {
      const left = Either.left(42);

      expect(left.isLeft()).toBe(true);
      expect(left.getLeft()).toBe(42);
    });

    it('should create Left either without value (void)', () => {
      const left = Either.left();

      expect(left.isLeft()).toBe(true);

      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(left.getLeft()).toBeUndefined();
    });

    it('should throw when accessing Right on Left either', () => {
      const left = Either.left(42);

      expect(() => left.getRight()).toThrowError(
        DataTypeInvariantViolationException,
      );
    });
  });

  describe('.map()', () => {
    it('should map Right correctly', () => {
      const right = Either.right(14).map(x => x * 3);

      expect(right.isRight()).toBe(true);
      expect(right.getRight()).toBe(42);
    });

    it('should not map Left', () => {
      const left = Either.left('fail').map(x => (x as number) * 2);

      expect(left.isLeft()).toBe(true);
      expect(left.getLeft()).toBe('fail');
    });
  });

  describe('.getOrElse()', () => {
    const value = 'test value';

    it('should return value on Right', () => {
      const right = Either.right(value);

      expect(right.isRight()).toBe(true);
      expect(right.getOrElse('foo')).toBe(value);
    });

    it('should return fallback on Left', () => {
      const left = Either.left(value);

      expect(left.isLeft()).toBe(true);
      expect(left.getOrElse('foo' as never)).toBe('foo');
    });
  });

  describe('.getOrElseLazy()', () => {
    const value = 'test value';

    it('should return value on Right', () => {
      const right = Either.right(value);

      expect(right.isRight()).toBe(true);
      expect(right.getOrElseLazy(() => 'foo')).toBe(value);
    });

    it('should return fallback on Left', () => {
      const left = Either.left(value);

      expect(left.isLeft()).toBe(true);
      expect(left.getOrElseLazy((() => 'foo') as never)).toBe('foo');
    });
  });

  describe('.combine()', () => {
    it('should return Right if all eithers succeed', () => {
      const eitherOne = Either.right(42);
      const eitherTwo = Either.right('foo');
      const eitherThree = Either.right();

      const combined = Either.combine([eitherOne, eitherTwo, eitherThree]);

      expect(combined.isRight()).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      expect(combined.getRight()).toBe(undefined);
    });

    it('should return first Left if any Either is Left', () => {
      const eitherOne = Either.right('bar');
      const eitherTwo = Either.left('Failed at step 2');
      const eitherThree = Either.right('baz');
      const eitherFour = Either.left('Failed at step 4');

      const combined = Either.combine([
        eitherOne,
        eitherTwo,
        eitherThree,
        eitherFour,
      ]);

      expect(combined.isLeft()).toBe(true);
      expect(combined.getLeft()).toBe('Failed at step 2');
    });
  });

  describe('.mapAsync()', () => {
    it('should asynchronously transform right value', async () => {
      const result = Either.right(3);

      const mapped = await result.mapAsync(
        async n => await Promise.resolve(n + 7),
      );

      expect(mapped.isRight()).toBe(true);
      expect(mapped.getRight()).toBe(10);
    });

    it('should not map Left', async () => {
      const result = Either.left('async error');

      const mapped = await result.mapAsync(
        async (n: number) => await Promise.resolve(n + 1),
      );

      expect(mapped.isLeft()).toBe(true);
      expect(mapped.getLeft()).toBe('async error');
    });
  });

  describe('.mapLeft()', () => {
    it('should mapLeft correctly', () => {
      const left = Either.left('fail').mapLeft(error => error.toUpperCase());

      expect(left.isLeft()).toBe(true);
      expect(left.getLeft()).toBe('FAIL');
    });

    it('should not map Right', () => {
      const right = Either.right(14).mapLeft(x => x * 3);

      expect(right.isRight()).toBe(true);
      expect(right.getRight()).toBe(14);
    });
  });

  describe('.flatMap()', () => {
    it('should flatMap Right correctly', () => {
      const result = Either.right(6)
        .flatMap(value => Either.right(value * 9))
        .flatMap(value => Either.right(value - 12));

      expect(result.isRight()).toBe(true);
      expect(result.getRight()).toBe(42);
    });

    it('should short-circuit Left in flatMap', () => {
      const result = Either.right(42)
        .flatMap(() => Either.left('fail'))
        .flatMap(() => Either.right(777));

      expect(result.isLeft()).toBe(true);
      expect(result.getLeft()).toBe('fail');
    });
  });

  describe('.flatMapAsync()', () => {
    it('should asynchronously transform right value', async () => {
      const result = Either.right(4);

      const flatMapped = await result.flatMapAsync(
        async n => await Promise.resolve(Either.right(n * 2)),
      );

      expect(flatMapped.isRight()).toBe(true);
      expect(flatMapped.getRight()).toBe(8);
    });

    it('should return same left value if either is left', async () => {
      const result = Either.left('initial value');

      const flatMapped = await result.flatMapAsync(
        async (n: number) => await Promise.resolve(Either.right(n * 2)),
      );

      expect(flatMapped.isLeft()).toBe(true);
      expect(flatMapped.getLeft()).toBe('initial value');
    });

    it('should propagate inner async failure into Either', async () => {
      //@ts-expect-error allowed it tests.
      const result: Either<number, string> = Either.right(100);

      const flatMapped = await result.flatMapAsync(
        async () => await Promise.resolve(Either.left('inner left')),
      );

      expect(flatMapped.isLeft()).toBe(true);
      expect(flatMapped.getLeft()).toBe('inner left');
    });
  });

  describe('.fold()', () => {
    it('should fold Right correctly', () => {
      const result = Either.right(7).fold(
        () => 'failed',
        value => `success: ${value.toString()}`,
      );

      expect(result).toBe('success: 7');
    });

    it('should fold Left correctly', () => {
      const result = Either.left('oops').fold(
        error => `error: ${error}`,
        () => 'success',
      );

      expect(result).toBe('error: oops');
    });
  });

  describe('.tryCatch()', () => {
    it('should wrap tryCatch correctly on success', () => {
      const result = Either.tryCatch(
        () => 42,
        error => (error as Error).message,
      );

      expect(result.isRight()).toBe(true);
      expect(result.getRight()).toBe(42);
    });

    it('should wrap tryCatch correctly on error', () => {
      const error = 'something went wrong';

      const result = Either.tryCatch(
        () => {
          throw new Error(error);
        },
        error => (error as Error).message,
      );

      expect(result.isLeft()).toBe(true);
      expect(result.getLeft()).toBe(error);
    });
  });

  describe('.toString()', () => {
    it('should serialize right value', () => {
      const result = Either.right(42);

      expect(result.toString()).toBe('Right(42)');
    });

    it('should serialize left value', () => {
      const result = Either.left(42);

      expect(result.toString()).toBe('Left(42)');
    });
  });
});
