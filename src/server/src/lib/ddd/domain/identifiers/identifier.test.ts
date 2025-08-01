import { EmptyIdentifierFailure } from './identifier-errors';
import { Identifier } from './identifier';

describe('identifier', () => {
  it('should create an Identifier with a valid primitive value', () => {
    const id = new Identifier('abc123');

    expect(id.toValue()).toBe('abc123');
  });

  it('should throw an error when created with null', () => {
    const { message, name } = new EmptyIdentifierFailure();

    // eslint-disable-next-line unicorn/no-null
    expect(() => new Identifier(null)).toThrow(
      new Error(message, { cause: name }),
    );
  });

  it('should throw an error when created with undefined', () => {
    const { message, name } = new EmptyIdentifierFailure();

    expect(() => new Identifier(undefined)).toThrow(
      new Error(message, { cause: name }),
    );
  });

  describe('.equals()', () => {
    it('should return true for equality with same value and type', () => {
      const idOne = new Identifier('foo');

      const idTwo = new Identifier('foo');

      expect(idOne.equals(idTwo)).toBe(true);
    });

    it('should return false for equality with different values', () => {
      const idOne = new Identifier(1);

      const idTwo = new Identifier(2);

      expect(idOne.equals(idTwo)).toBe(false);
    });

    it('should return false for equality with undefined', () => {
      const id = new Identifier('foo');

      expect(id.equals()).toBe(false);
    });

    it('should return false when comparing identifiers of different subclasses', () => {
      class FooId extends Identifier<string> {}

      class BarId extends Identifier<string> {}

      const fooId = new FooId('foo');

      const barId = new BarId('bar');

      expect(fooId.equals(barId)).toBe(false);
    });
  });

  describe('.toString()', () => {
    it('should return string representation of the value', () => {
      const id = new Identifier(123);

      expect(id.toString()).toBe('123');
    });
  });
});
