import { Time } from './time';

class TestTime extends Time<TestTime> {
  static create(date: Date): TestTime {
    return new TestTime(date);
  }
}

describe('time', () => {
  const isoString = '2025-08-12T10:15:30.000Z';

  describe('.fromDate()', () => {
    it('should create from valid Date object', () => {
      const now = new Date(isoString);

      const result = TestTime.fromDate(now);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toDate()).toStrictEqual(now);
    });

    it('should return a typed instance', () => {
      const now = new Date(isoString);

      const result = TestTime.fromDate(now);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(TestTime);
    });

    it('should fail on invalid date', () => {
      const result = TestTime.fromDate(new Date('not-a-date'));

      expect(result.isFailure).toBe(true);
    });
  });

  describe('.fromISOString()', () => {
    it('should create from valid ISO string', () => {
      const result = TestTime.fromISOString(isoString);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toISOString()).toBe(isoString);
    });

    it('should fail on invalid ISO string', () => {
      const result = TestTime.fromISOString('not-an-iso-string');

      expect(result.isFailure).toBe(true);
    });
  });

  describe('.fromUnixMillis()', () => {
    const ms = 1_735_689_600_000;

    it('should create from unix milliseconds', () => {
      const result = TestTime.fromUnixMilliSeconds(ms);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toUnixMilliSeconds()).toBe(ms);
    });
  });

  describe('.fromNow()', () => {
    it('should create from now', () => {
      const result = TestTime.fromNow();

      expect(result.isSuccess).toBe(true);

      expect(
        Math.abs(result.value.toUnixMilliSeconds() - Date.now()),
      ).toBeLessThan(5);
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
      const time = TestTime.fromUnixMilliSeconds(1000).value;

      const result = time.addMilliSeconds(500);

      expect(result.toUnixMilliSeconds()).toBe(1500);
    });

    it('should subtract milliseconds', () => {
      const time = TestTime.fromUnixMilliSeconds(1500).value;

      const result = time.subtractMilliSeconds(500);

      expect(result.toUnixMilliSeconds()).toBe(1000);
    });
  });
});
