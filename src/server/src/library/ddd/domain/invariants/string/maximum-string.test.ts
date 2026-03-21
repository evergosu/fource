/* eslint-disable unicorn/no-null */
/* eslint-disable sonarjs/no-primitive-wrappers */
/* eslint-disable unicorn/new-for-builtins */
import { MaximumLengthStringFailure, guardMaximumLengthString } from './maximum-string';
import { testGuardContract } from '../make-guards.test';

describe('guardMaximumLengthString', () => {
  testGuardContract({
    invalid: [
      '12345678', // max + 1
      'loooong string',
      new String('12345678'),
      1,
      null,
      undefined,
    ],
    valid: [
      '',
      '1234567', // exactly max
      'foo',
    ],
    failure: MaximumLengthStringFailure('test', 7),
    guard: guardMaximumLengthString('test', 7),
  });
});
