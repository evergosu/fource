import { type DomainFailure, domainFailure } from '../issues/failure';
import { Result } from '../../types/result';
import { Time } from './time';

type TestFailure = {
  readonly _tag: 'TestFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const TestFailure = (name: string): TestFailure =>
  domainFailure({
    _tag: 'TestFailure',
    name,
  });

class TestTime extends Time<TestTime> {
  public static _internalCreate(date: Date): Result<TestTime, TestFailure> {
    if (date.getTime() === 999) {
      return Result.fail(TestFailure(this.name));
    }

    return Result.ok(new TestTime(date));
  }
}

class TestTimeWithValidators extends Time<TestTimeWithValidators> {
  public static _internalCreate(
    date: Date,
    validators: [validate: () => 999],
  ): Result<TestTimeWithValidators, TestFailure> {
    const [validate] = validators;

    if (date.getTime() === validate()) {
      return Result.fail(TestFailure(this.name));
    }

    return Result.ok(new TestTimeWithValidators(date));
  }
}

describe('time', () => {
  const isoString = '2025-08-12T10:15:30.000Z';

  it('should throw if validators has not been passed', () => {
    expect(() => TestTimeWithValidators.fromISOString('2025-08-10T10:15:30.000Z')).toThrow();
  });

  describe('.fromDate()', () => {
    it('should create from valid Date object', () => {
      const now = new Date(isoString);

      const result = TestTime.fromDate(now);

      expect(result.isSuccess()).toBe(true);
      expect(result.value.toDate()).toStrictEqual(now);
    });

    it('should return a typed instance', () => {
      const now = new Date(isoString);

      const result = TestTime.fromDate(now);

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBeInstanceOf(TestTime);
    });

    it('should fail on invalid date', () => {
      const result = TestTime.fromDate(new Date('not-a-date'));

      expect(result.isFailure()).toBe(true);
      expect(result.error.name).toBe(TestTime.name);
      expect(result.error._tag).toBe('TimeFailure');
      expect(result.error.cause._tag).toBe('DateFailure');
    });
  });

  describe('.fromISOString()', () => {
    it('should create from valid ISO string', () => {
      const result = TestTime.fromISOString(isoString);

      expect(result.isSuccess()).toBe(true);
      expect(result.value.toISOString()).toBe(isoString);
    });

    it('should fail on invalid ISO string', () => {
      const result = TestTime.fromISOString('not-an-iso-string');

      expect(result.isFailure()).toBe(true);
      expect(result.error.name).toBe(TestTime.name);
      expect(result.error._tag).toBe('TimeFailure');
      expect(result.error.cause._tag).toBe('ISOStringFailure');
    });
  });

  describe('.fromUnixMilliSeconds()', () => {
    const ms = 1_735_689_600_000;

    it('should create from unix milliseconds', () => {
      const result = TestTime.fromUnixMilliSeconds(ms);

      expect(result.isSuccess()).toBe(true);
      expect(result.value.toUnixMilliSeconds()).toBe(ms);
    });
  });

  describe('.fromNow()', () => {
    it('should create from now', () => {
      const result = TestTime.fromNow();

      expect(result.isSuccess()).toBe(true);

      expect(Math.abs(result.value.toUnixMilliSeconds() - Date.now())).toBeLessThan(5);
    });
  });

  describe('math', () => {
    const timeOne = TestTime.fromUnixMilliSeconds(1000).value;
    const timeTwo = TestTime.fromUnixMilliSeconds(2000).value;
    const timeThree = TestTime.fromUnixMilliSeconds(3000).value;

    it('should compare times correctly', () => {
      expect(timeOne.equals(timeOne)).toBe(true);
      expect(timeOne.equals(timeTwo)).toBe(false);

      expect(timeOne.isBefore(timeTwo)).toBe(true);
      expect(timeTwo.isBefore(timeOne)).toBe(false);

      expect(timeTwo.isAfter(timeOne)).toBe(true);
      expect(timeOne.isAfter(timeTwo)).toBe(false);

      expect(timeTwo.isBetween(timeOne, timeThree)).toBe(true);
      expect(timeOne.isBetween(timeTwo, timeThree)).toBe(false);
    });

    it('should add milliseconds', () => {
      const result = TestTime.fromUnixMilliSeconds(1000).flatMap(t => t.addMilliSeconds(500));

      expect(result.value.toUnixMilliSeconds()).toBe(1500);
    });

    it('should subtract milliseconds', () => {
      const result = TestTime.fromUnixMilliSeconds(1500).flatMap(t => t.subtractMilliSeconds(500));

      expect(result.value.toUnixMilliSeconds()).toBe(1000);
    });
  });
});
