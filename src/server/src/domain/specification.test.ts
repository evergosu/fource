import { Specification } from './specification';

class EvenNumberSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate % 2 === 0;
  }
}

class GreaterThanFiveSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate > 5;
  }
}

describe('specification', () => {
  test('should be satisfied by even numbers', () => {
    const specification = new EvenNumberSpecification();

    expect(specification.isSatisfiedBy(2)).toBe(true);

    expect(specification.isSatisfiedBy(3)).toBe(false);
  });

  test('should be satisfied by numbers greater than five', () => {
    const specification = new GreaterThanFiveSpecification();

    expect(specification.isSatisfiedBy(6)).toBe(true);

    expect(specification.isSatisfiedBy(5)).toBe(false);
  });

  test('should combine specifications with AND', () => {
    const specification = new EvenNumberSpecification().and(
      new GreaterThanFiveSpecification(),
    );

    expect(specification.isSatisfiedBy(6)).toBe(true);

    expect(specification.isSatisfiedBy(4)).toBe(false);

    expect(specification.isSatisfiedBy(7)).toBe(false);
  });

  test('should combine specifications with OR', () => {
    const specification = new EvenNumberSpecification().or(
      new GreaterThanFiveSpecification(),
    );

    expect(specification.isSatisfiedBy(6)).toBe(true);

    expect(specification.isSatisfiedBy(4)).toBe(true);

    expect(specification.isSatisfiedBy(7)).toBe(true);

    expect(specification.isSatisfiedBy(3)).toBe(false);
  });

  test('should invert specification with NOT', () => {
    const specification = new EvenNumberSpecification().not();

    expect(specification.isSatisfiedBy(3)).toBe(true);

    expect(specification.isSatisfiedBy(4)).toBe(false);
  });
});
