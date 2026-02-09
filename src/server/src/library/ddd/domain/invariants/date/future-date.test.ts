/* eslint-disable unicorn/no-null */
import { FutureDateFailure, guardFutureDate } from './future-date';
import { testGuardContract } from '../make-guards.test';

describe('guardFutureDate', () => {
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
    invalid: [dateNow, dateInPast, new Date('invalid'), null],
    failure: FutureDateFailure('test'),
    guard: guardFutureDate('test'),
    valid: [dateInFuture],
  });
});
