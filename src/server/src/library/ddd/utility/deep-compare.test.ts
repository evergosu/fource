import { deepCompare } from './deep-compare';

describe('deep equal', () => {
  it('should return true for primitives that are equal', () => {
    expect(deepCompare(1, 1)).toBe(true);
    expect(deepCompare('a', 'a')).toBe(true);
    expect(deepCompare(true, true)).toBe(true);
    // eslint-disable-next-line unicorn/no-null
    expect(deepCompare(null, null)).toBe(true);
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(deepCompare(undefined, undefined)).toBe(true);
  });

  it('should return false for primitives that are different', () => {
    expect(deepCompare(1, 2)).toBe(false);
    expect(deepCompare('a', 'b')).toBe(false);
    expect(deepCompare(true, false)).toBe(false);
  });

  it('should return false if types mismatch', () => {
    expect(deepCompare({}, [])).toBe(false);
    // eslint-disable-next-line unicorn/no-null
    expect(deepCompare({}, null)).toBe(false);
    // eslint-disable-next-line unicorn/no-null
    expect(deepCompare([], null)).toBe(false);
  });

  it('should return false for arrays with different elements', () => {
    expect(deepCompare([1, 2], [1, 2, 3])).toBe(false);
  });

  it('should return true for equal arrays', () => {
    expect(deepCompare([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false if object keys are missing', () => {
    expect(deepCompare({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('should return false for flat objects with different values', () => {
    expect(deepCompare({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('should return true for equal flat objects, no matter of keys order', () => {
    expect(deepCompare({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('should return true for deeply equal nested objects', () => {
    expect(deepCompare({ a: { b: [1, 2], c: 'foo' } }, { a: { b: [1, 2], c: 'foo' } })).toBe(true);
  });

  it('should return false for deeply unequal nested objects', () => {
    expect(deepCompare({ a: { b: [1, 2], c: 'foo' } }, { a: { b: [1, 2, 3], c: 'foo' } })).toBe(false);
  });

  it('should return true for equal Date objects', () => {
    const dateOne = new Date('2025-01-01T00:00:00Z');

    const dateTwo = new Date('2025-01-01T00:00:00Z');

    expect(deepCompare(dateOne, dateTwo)).toBe(true);
  });

  it('should return false for unequal Date objects', () => {
    const dateOne = new Date('2025-01-01T00:00:00Z');

    const dateTwo = new Date('2026-01-01T00:00:00Z');

    expect(deepCompare(dateOne, dateTwo)).toBe(false);
  });

  it('should handle dates inside arrays', () => {
    const a = [new Date('2025-01-01T00:00:00Z'), 42];

    const b = [new Date('2025-01-01T00:00:00Z'), 42];

    expect(deepCompare(a, b)).toBe(true);
  });

  it('should return false for dates inside arrays if any date differs', () => {
    const a = [new Date('2025-01-01T00:00:00Z'), 42];

    const b = [new Date('2026-01-01T00:00:00Z'), 42];

    expect(deepCompare(a, b)).toBe(false);
  });

  it('should handle nested Date objects correctly', () => {
    const a = {
      createdAt: new Date('2025-01-01T00:00:00Z'),
      name: 'John',
    };

    const b = {
      createdAt: new Date('2025-01-01T00:00:00Z'),
      name: 'John',
    };

    expect(deepCompare(a, b)).toBe(true);
  });

  it('should return false for nested Date objects with different dates', () => {
    const a = {
      createdAt: new Date('2025-01-01T00:00:00Z'),
      name: 'John',
    };

    const b = {
      createdAt: new Date('2026-01-01T00:00:00Z'),
      name: 'John',
    };

    expect(deepCompare(a, b)).toBe(false);
  });
});
