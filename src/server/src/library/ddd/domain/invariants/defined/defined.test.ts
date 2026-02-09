/* eslint-disable unicorn/no-null */
import { NullishFailure, guardDefined } from './defined';
import { testGuardContract } from '../make-guards.test';

describe('guardDefined', () => {
  testGuardContract({
    // eslint-disable-next-line prettier/prettier
    valid: [0, '', false, true, {}, [], () => { }, Symbol('x'), new Date()],
    failure: NullishFailure('test'),
    guard: guardDefined('test'),
    invalid: [null, undefined],
  });
});
