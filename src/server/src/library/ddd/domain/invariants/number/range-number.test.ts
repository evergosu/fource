/* eslint-disable unicorn/no-null */
import { OutOfRangeNumberFailure, guardOutOfRangeNumber } from './range-number';
import { testGuardContract } from '../make-guards.test';

describe('guardOutOfRangeNumber', () => {
  testGuardContract({
    invalid: [
      42, // lower bound
      69, // upper bound
      0,
      -1,
      99,
      Number.NaN,
      Infinity,
      '50',
      null,
      undefined,
    ],
    failure: OutOfRangeNumberFailure('test', 42, 69),
    guard: guardOutOfRangeNumber('test', 42, 69),
    valid: [43, 55, 68],
  });
});
