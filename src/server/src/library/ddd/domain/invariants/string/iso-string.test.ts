/* eslint-disable unicorn/no-null */
import { ISOStringFailure, guardISOString } from './iso-string';
import { testGuardContract } from '../make-guards.test';

describe('guardISOString', () => {
  testGuardContract({
    invalid: ['2025-01-01', '2025-01-01T00:00:00', '01-01-2025T00:00:00Z', '', 1, null, undefined],
    valid: ['2025-01-01T00:00:00Z', '1999-12-31T23:59:59Z'],
    failure: ISOStringFailure('test'),
    guard: guardISOString('test'),
  });
});
