/* eslint-disable unicorn/no-null */
import {
  MinimumLengthStringFailure,
  guardMinimumLengthString,
} from './minimum-string';
import { testGuardContract } from '../make-guards.test';

describe('guardMinimumLengthString', () => {
  testGuardContract({
    invalid: [
      '',
      '123456', // min - 1
      '   ', // length < min after trim?
      123,
      null,
      undefined,
    ],
    valid: [
      '1234567', // exactly min
      '12345678',
      'loooong string',
    ],
    failure: MinimumLengthStringFailure('test', 7),
    guard: guardMinimumLengthString('test', 7),
  });
});
