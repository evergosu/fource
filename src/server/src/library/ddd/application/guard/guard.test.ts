import {
  MaximumLengthExceededFailure,
  MinimumLengthNotMetFailure,
  NullOrUndefinedFailure,
  InvalidFormatFailure,
  InvalidEmailFailure,
  BlankStringFailure,
  DateInPastFailure,
  OutOfRangeFailure,
  ISODateFailure,
  StringFailure,
  NumberFailure,
  DateFailure,
} from './guard-errors';
import { Guard } from './guard';

describe('guard', () => {
  const dateISOString = '2025-01-01T00:00:00Z';

  const dateNow = new Date(dateISOString);

  const dateInFuture = new Date(dateNow.getTime() + 1);

  const dateInPast = new Date(dateNow.getTime() - 1);

  const object = {
    stringWithWhitespaces: ' foo ',
    stringWhitespacesOnly: '     ',
    emailInvalid: 'invalid@email',
    emailValid: 'valid@email.com',
    stringLong: 'foo bar baz',
    undefined: undefined,
    stringMixed: '42foo',
    stringNumber: '42',
    stringEmpty: '',
    dateISOString,
    string: 'foo',
    dateInFuture,
    dateInPast,
    dateNow,
    // eslint-disable-next-line unicorn/new-for-builtins, sonarjs/no-primitive-wrappers
    stringBoxed: new String('foo'),
    numberSmall: 34,
    numberBig: 69,
    // eslint-disable-next-line unicorn/no-null
    null: null,
    number: 42,
  };

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(object.dateNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const guard = Guard.for(object);

  describe('Guard.againstNullOrUndefined()', () => {
    it('should fail on null', () => {
      const result = guard.againstNullOrUndefined('null');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should fail on undefined', () => {
      const result = guard.againstNullOrUndefined('undefined');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should pass on value', () => {
      const result = guard.againstNullOrUndefined('string');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstNotNumber()', () => {
    it('should fail on not a number', () => {
      const result = guard.againstNotNumber('string');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(NumberFailure);
    });

    it('should pass on regular number', () => {
      const result = guard.againstNotNumber('number');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstNotString()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstNotString('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should pass on regular string', () => {
      const result = guard.againstNotString('string');

      expect(result.isSuccess).toBe(true);
    });

    it('should pass on class created string', () => {
      const result = guard.againstNotString('stringBoxed');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstBlankString()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstNotString('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on empty string', () => {
      const result = guard.againstBlankString('stringEmpty');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(BlankStringFailure);
    });

    it('should fail on string with only whitespaces', () => {
      const result = guard.againstBlankString('stringWhitespacesOnly');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(BlankStringFailure);
    });

    it('should pass on value', () => {
      const result = guard.againstBlankString('stringWithWhitespaces');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstMinimumLength()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstMinimumLength('number', 7);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on short string', () => {
      const result = guard.againstMinimumLength('string', 7);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(MinimumLengthNotMetFailure);
    });

    it('should pass on long string', () => {
      const result = guard.againstMinimumLength('stringLong', 7);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstMaximumLength()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstMaximumLength('number', 7);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on long string', () => {
      const result = guard.againstMaximumLength('stringLong', 7);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(MaximumLengthExceededFailure);
    });

    it('should pass on short string', () => {
      const result = guard.againstMaximumLength('string', 7);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstInvalidFormat()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstInvalidFormat('number', /^\d+$/);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on regex mismatch', () => {
      const result = guard.againstInvalidFormat('stringMixed', /^\d+$/);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(InvalidFormatFailure);
    });

    it('should pass on regex match', () => {
      const result = guard.againstInvalidFormat('stringNumber', /^\d+$/);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstInvalidEmail()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstInvalidEmail('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on invalid email', () => {
      const result = guard.againstInvalidEmail('emailInvalid');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(InvalidEmailFailure);
    });

    it('should pass on valid email', () => {
      const result = guard.againstInvalidEmail('emailValid');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstNotDate()', () => {
    it('should fail on not a Date', () => {
      const result = guard.againstNotDate('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(DateFailure);
    });

    it('should pass on valid date object', () => {
      const result = guard.againstNotDate('dateNow');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstISODateString()', () => {
    it('should fail on not a string', () => {
      const result = guard.againstISODateString('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail on not an ISO date string', () => {
      const result = guard.againstISODateString('string');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(ISODateFailure);
    });

    it('should pass on a valid ISO 8601 date string', () => {
      const result = guard.againstISODateString('dateISOString');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstDateInPast()', () => {
    it('should fail on not a date', () => {
      const result = guard.againstDateInPast('number');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(DateFailure);
    });

    it('should fail on past date', () => {
      const result = guard.againstDateInPast('dateInPast');

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(DateInPastFailure);
    });

    it('should pass on future date', () => {
      const result = guard.againstDateInPast('dateInFuture');

      expect(result.isSuccess).toBe(true);
    });

    it('should pass on now date', () => {
      const result = guard.againstDateInPast('dateNow');

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('Guard.againstOutOfRange()', () => {
    it('should fail on not a number', () => {
      const result = guard.againstOutOfRange('string', 34, 42);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(OutOfRangeFailure);
    });

    it('should fail if value is less then minimum', () => {
      const result = guard.againstOutOfRange('numberSmall', 42, 69);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(OutOfRangeFailure);
    });

    it('should fail if value is more then maximum', () => {
      const result = guard.againstOutOfRange('numberBig', 34, 42);

      expect(result.isFailure).toBe(true);

      expect(result.error).toBeInstanceOf(OutOfRangeFailure);
    });

    it('should pass if value is in range', () => {
      const result = guard.againstOutOfRange('number', 34, 69);

      expect(result.isSuccess).toBe(true);
    });
  });
});
