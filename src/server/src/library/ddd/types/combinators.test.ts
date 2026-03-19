import { combineEithers, combineResults } from './combinators';
import { Either } from './either';
import { Result } from './result';

describe('combinators', () => {
  describe('.combineResults()', () => {
    it('should return result of values if all results succeed', () => {
      const resultOne = Result.ok(42);
      const resultTwo = Result.ok('foo');
      const resultThree = Result.ok();

      const combined = combineResults([resultOne, resultTwo, resultThree]);

      expect(combined.isSuccess()).toBe(true);
      expect(combined).toStrictEqual(Result.ok([42, 'foo', undefined]));
      expect(combined.value).toStrictEqual([42, 'foo', undefined]);
    });

    it('should return result of errors if any result is failed', () => {
      const resultOne = Result.ok('bar');
      const resultTwo = Result.fail('Failed at step 2');
      const resultThree = Result.ok('baz');
      const resultFour = Result.fail('Failed at step 4');

      const combined = combineResults([resultOne, resultTwo, resultThree, resultFour]);

      expect(combined.isFailure()).toBe(true);
      expect(combined.error).toStrictEqual(['Failed at step 2', 'Failed at step 4']);
    });
  });

  describe('.combineEithers()', () => {
    it('should return either of right values if all eithers is right', () => {
      const eitherOne = Either.right(42);
      const eitherTwo = Either.right('foo');
      const eitherThree = Either.right();

      const combined = combineEithers([eitherOne, eitherTwo, eitherThree]);

      expect(combined.isRight()).toBe(true);
      expect(combined).toStrictEqual(Either.right([42, 'foo', undefined]));
      expect(combined.getRight()).toStrictEqual([42, 'foo', undefined]);
    });

    it('should return either of left values if any either is left', () => {
      const eitherOne = Either.right('bar');
      const eitherTwo = Either.left('Failed at step 2');
      const eitherThree = Either.right('baz');
      const eitherFour = Either.left('Failed at step 4');

      const combined = combineEithers([eitherOne, eitherTwo, eitherThree, eitherFour]);

      expect(combined.isLeft()).toBe(true);
      expect(combined.getLeft()).toStrictEqual(['Failed at step 2', 'Failed at step 4']);
    });
  });
});
