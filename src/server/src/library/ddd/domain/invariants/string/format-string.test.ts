/* eslint-disable unicorn/new-for-builtins */
/* eslint-disable sonarjs/no-primitive-wrappers */
/* eslint-disable unicorn/no-null */
import { FormatStringFailure, guardFormatString } from './format-string';
import { testGuardContract } from '../make-guards.test';

describe('guardFormatString', () => {
  testGuardContract({
    invalid: ['', ' ', '42 foo', 'foo', new String('42'), 42, null, undefined],
    failure: FormatStringFailure('test', /^\d+$/),
    guard: guardFormatString('test', /^\d+$/),
    valid: ['0', '42', '123456'],
  });
});
