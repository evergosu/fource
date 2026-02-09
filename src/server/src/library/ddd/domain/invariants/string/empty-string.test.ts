/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/new-for-builtins */
/* eslint-disable sonarjs/no-primitive-wrappers */
import { EmptyStringFailure, guardEmptyString } from './empty-string';
import { testGuardContract } from '../make-guards.test';

describe('guardEmptyString', () => {
  testGuardContract({
    invalid: [
      '',
      ' ',
      '   ',
      '\n',
      '\t',
      new String(''),
      new String('   '),
      1,
      null,
      undefined,
    ],
    valid: ['a', 'foo', ' a ', new String('foo')],
    failure: EmptyStringFailure('test'),
    guard: guardEmptyString('test'),
  });
});
