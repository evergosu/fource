import { deepFreeze } from './deep-freeze';

describe('deep freeze', () => {
  it('should deeply freeze nested objects', () => {
    const object = {
      nested: {
        b: [1, 2, { c: 3 }],
        a: 1,
      },
      foo: 'bar',
    };

    const frozen = deepFreeze(object);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(Object.isFrozen(frozen.nested.b)).toBe(true);
    expect(Object.isFrozen(frozen.nested.b[2])).toBe(true);

    expect(() => {
      frozen.nested.a = 42;
    }).toThrow();
  });
});
