/* eslint-disable unicorn/no-null */
import { PastDateFailure, guardPastDate } from './past-date';
import { testGuardContract } from '../make-guards.test';

describe('guardPastDate', () => {
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
    invalid: [dateNow, dateInFuture, new Date('invalid'), null],
    failure: PastDateFailure('test'),
    guard: guardPastDate('test'),
    valid: [dateInPast],
  });
});
