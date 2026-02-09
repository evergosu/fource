/* eslint-disable unicorn/no-null */
import { testGuardContract } from '../make-guards.test';
import { DateFailure, guardDate } from './date';

describe('guardDate', () => {
  const dateISOString = '2025-01-01T00:00:00Z';

  const dateNow = new Date(dateISOString);

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(dateNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  testGuardContract({
    invalid: ['2025-01-01', new Date('invalid'), Date.now(), null, undefined],
    valid: [new Date(), new Date(0)],
    failure: DateFailure('test'),
    guard: guardDate('test'),
  });
});
