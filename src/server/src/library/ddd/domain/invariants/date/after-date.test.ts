/* eslint-disable unicorn/no-null */
import { AfterDateFailure, guardAfterDate } from './after-date';
import { testGuardContract } from '../make-guards.test';

describe('guardAfterDate', () => {
  const dateISOString = '2025-01-01T00:00:00Z';

  const dateNow = new Date(dateISOString);

  const dateInFuture = new Date(dateNow.getTime() + 1);

  const dateInPast = new Date(dateNow.getTime() - 1);

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(dateNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  testGuardContract({
    invalid: [dateNow, dateInPast, new Date('invalid'), '2025-01-01', null],
    failure: AfterDateFailure('test', dateNow),
    guard: guardAfterDate('test', dateNow),
    valid: [dateInFuture],
  });
});
