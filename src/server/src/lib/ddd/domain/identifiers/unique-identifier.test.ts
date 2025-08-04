import {
  StringOrNumberIdentifierFailure,
  BlankIdentifierFailure,
} from './identifier-errors';
import { UniqueIdentifier } from './unique-identifier';

describe('unique identifier', () => {
  it('should generate a valid UUIDv7 when no value is provided', () => {
    const result = UniqueIdentifier.create();

    expect(typeof result.value.toValue()).toBe('string');

    expect(result.value.toValue()).toMatch(/^[\da-f-]{36}$/);
  });

  it('should accept a valid string identifier', () => {
    const value = 'foo';

    const result = UniqueIdentifier.create(value);

    expect(result.value.toValue()).toBe(value);
  });

  it('should accept a valid numeric identifier', () => {
    const value = 42;

    const result = UniqueIdentifier.create(value);

    expect(result.value.toValue()).toBe(value);
  });

  it('should return failure for empty string', () => {
    const result = UniqueIdentifier.create('');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(BlankIdentifierFailure);
  });

  it('should return failure for null', () => {
    // eslint-disable-next-line unicorn/no-null
    const result = UniqueIdentifier.create(null as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StringOrNumberIdentifierFailure);
  });

  it('should return failure for objects', () => {
    const result = UniqueIdentifier.create({} as unknown as string);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(StringOrNumberIdentifierFailure);
  });

  describe('.equals()', () => {
    it('should consider two instances equal if values match', () => {
      const resultOne = UniqueIdentifier.create('foo');

      const resultTwo = UniqueIdentifier.create('foo');

      expect(resultOne.value.equals(resultTwo.value)).toBe(true);
    });
  });

  describe('.toString()', () => {
    it('should return string representation of the value', () => {
      const result = UniqueIdentifier.create(123);

      expect(result.value.toString()).toBe('123');
    });
  });
});
