/**
 * A specification defines a business rule or filter that can be evaluated against objects.
 * @template T The type of object this specification operates on.
 */
export abstract class Specification<T> {
  /**
   * Determines whether a candidate satisfies this specification.
   * @param candidate - The object to evaluate.
   * @returns `true` if the candidate satisfies the specification, otherwise `false`.
   */
  public abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Combines this specification with another using logical AND.
   * @param other - Another specification.
   * @returns A new specification that represents the logical AND.
   */
  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  /**
   * Combines this specification with another using logical OR.
   * @param other - Another specification.
   * @returns A new specification that represents the logical OR.
   */
  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  /**
   * Negates this specification.
   * @returns A new specification that represents the logical NOT.
   */
  public not(): Specification<T> {
    return new NotSpecification(this);
  }

  /**
   * ---
   * Serializes current `Specification` for logging purpose.
   * ---
   *@returns A formatted string.
   */
  public toString(): string {
    return JSON.stringify(this.constructor.name);
  }

  /**
   * ---
   * Adds better Node.js debugging support.
   * ---
   * @returns serialized `Specification` values.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
    );
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>,
  ) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
    );
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
  }

  public isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
