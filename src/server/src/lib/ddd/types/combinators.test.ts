import { combineResults } from './combinators';
import { Result } from './result';

describe('combinators', () => {
  describe('.combineResults()', () => {
    it('should return result of values if all results succeed', () => {
      const resultOne = Result.ok(42);
      const resultTwo = Result.ok('foo');
      const resultThree = Result.ok();

      const combined = combineResults([resultOne, resultTwo, resultThree]);

      expect(combined.isSuccess).toBe(true);
      expect(combined).toStrictEqual(Result.ok([42, 'foo', undefined]));
      expect(combined.value).toStrictEqual([42, 'foo', undefined]);
    });

    it('should return result of errors if any result is failed', () => {
      const resultOne = Result.ok('bar');
      const resultTwo = Result.fail('Failed at step 2');
      const resultThree = Result.ok('baz');
      const resultFour = Result.fail('Failed at step 4');

      const combined = combineResults([
        resultOne,
        resultTwo,
        resultThree,
        resultFour,
      ]);

      expect(combined.isFailure).toBe(true);
      expect(combined.error).toStrictEqual([
        'Failed at step 2',
        'Failed at step 4',
      ]);
    });
  });
});
