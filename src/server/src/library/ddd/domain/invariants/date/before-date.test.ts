/* eslint-disable unicorn/no-null */
import { BeforeDateFailure, guardBeforeDate } from './before-date';
import { testGuardContract } from '../make-guards.test';

describe('guardBeforeDate', () => {
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
    invalid: [
      dateNow, // equal should FAIL
      dateInFuture,
      new Date('invalid'),
      '2025-01-01',
      null,
    ],
    failure: BeforeDateFailure('test', dateNow),
    guard: guardBeforeDate('test', dateNow),
    valid: [dateInPast],
  });
});
