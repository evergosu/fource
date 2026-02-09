/* eslint-disable unicorn/no-null */
import { EmailStringFailure, guardEmailString } from './email-string';
import { testGuardContract } from '../make-guards.test';

describe('guardEmailString', () => {
  testGuardContract({
    invalid: [
      '',
      'invalid',
      'invalid@',
      '@email.com',
      'email@',
      'email@com',
      1,
      null,
      undefined,
    ],
    valid: ['a@b.co', 'user.name+tag@sub.domain.com', 'USER@EXAMPLE.COM'],
    failure: EmailStringFailure('test'),
    guard: guardEmailString('test'),
  });
});
