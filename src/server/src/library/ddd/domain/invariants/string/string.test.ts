import { testGuardContract } from '../make-guards.test';
import { StringFailure, guardString } from './string';

describe('guardString', () => {
  testGuardContract({
    // eslint-disable-next-line prettier/prettier, unicorn/no-null
    invalid: [1, true, {}, [], () => { }, Symbol('x'), null, undefined],
    // eslint-disable-next-line sonarjs/no-primitive-wrappers, unicorn/new-for-builtins
    valid: ['', 'foo', ' ', new String('foo')],
    failure: StringFailure('test'),
    guard: guardString('test'),
  });
});
