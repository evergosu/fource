/* eslint-disable unicorn/new-for-builtins */
/* eslint-disable sonarjs/no-primitive-wrappers */
/* eslint-disable unicorn/no-null */
import { testGuardContract } from '../make-guards.test';
import { NumberFailure, guardNumber } from './number';

describe('guardNumber', () => {
  testGuardContract({
    invalid: [Number.NaN, Infinity, -Infinity, '1', new Number(1), null, undefined, {}, [], true],
    failure: NumberFailure('test'),
    guard: guardNumber('test'),
    valid: [0, 1, -1, 42],
  });
});
