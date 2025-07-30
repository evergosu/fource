import {
  StringOrNumberIdentifierError,
  BlankIdentifierError,
} from './identifier-errors';
import { UniqueIdentifier } from './unique-identifier';

describe('unique identifier', () => {
  it('should generate a valid UUIDv7 when no value is provided', () => {
    const id = UniqueIdentifier.create();

    expect(typeof id.toValue()).toBe('string');

    expect(id.toValue()).toMatch(/^[\da-f-]{36}$/);
  });

  it('should accept a valid string identifier', () => {
    const value = 'foo';

    const id = UniqueIdentifier.create(value);

    expect(id.toValue()).toBe(value);
  });

  it('should accept a valid numeric identifier', () => {
    const value = 42;

    const id = UniqueIdentifier.create(value);

    expect(id.toValue()).toBe(value);
  });

  it('should throw for empty string', () => {
    expect(() => UniqueIdentifier.create('')).toThrow(
      new BlankIdentifierError(),
    );
  });

  it('should throw for null', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(() => UniqueIdentifier.create(null as unknown as string)).toThrow(
      new StringOrNumberIdentifierError(),
    );
  });

  it('should throw for objects', () => {
    expect(() => UniqueIdentifier.create({} as unknown as string)).toThrow(
      new StringOrNumberIdentifierError(),
    );
  });

  it('should consider two instances equal if values match', () => {
    const idOne = UniqueIdentifier.create('foo');

    const idTwo = UniqueIdentifier.create('foo');

    expect(idOne.equals(idTwo)).toBe(true);
  });
});
