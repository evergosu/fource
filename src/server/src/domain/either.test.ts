import { Either } from './either';

describe('either', () => {
  it('should create Right correctly', () => {
    const right = Either.right(42);

    expect(right.isRight()).toBe(true);
    expect(right.getRight()).toBe(42);
  });

  it('should create Left correctly', () => {
    const left = Either.left('error');

    expect(left.isLeft()).toBe(true);
    expect(left.getLeft()).toBe('error');
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
});
