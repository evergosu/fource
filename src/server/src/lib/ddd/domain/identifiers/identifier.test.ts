import { EmptyIdentifierFailure } from './identifier-errors';
import { Identifier } from './identifier';

describe('identifier', () => {
  it('should create an Identifier with a valid primitive value', () => {
    const result = Identifier.create('abc123');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeInstanceOf(Identifier);
    expect(result.value.toValue()).toBe('abc123');
  });

  it('should return failure when created with null', () => {
    // eslint-disable-next-line unicorn/no-null
    const result = Identifier.create(null);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(EmptyIdentifierFailure);
  });

  it('should return failure when created with undefined', () => {
    const result = Identifier.create();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(EmptyIdentifierFailure);
  });

  describe('.equals()', () => {
    it('should return true for equality with same value and type', () => {
      const resultOne = Identifier.create('foo');

      const resultTwo = Identifier.create('foo');

      expect(resultOne.value.equals(resultTwo.value)).toBe(true);
    });

    it('should return false for equality with different values', () => {
      const resultOne = Identifier.create(1);

      const resultTwo = Identifier.create(2);

      expect(resultOne.value.equals(resultTwo.value)).toBe(false);
    });

    it('should return false for equality with undefined', () => {
      const result = Identifier.create('foo');

      expect(result.value.equals()).toBe(false);
    });
  });

  describe('.toString()', () => {
    it('should return string representation of the value', () => {
      const result = Identifier.create(123);

      expect(result.value.toString()).toBe('123');
    });
  });
});
