import { NullishFailure, guardDefined } from '../invariants/defined/defined';
import { Result } from '../../types/result';

/**
 * ---
 * A strongly-typed identifier wrapper that encapsulates a raw value
 * and provides identity comparison and serialization logic.
 * ---
 * Commonly used to abstract away primitive IDs (like UUIDs or numbers)
 * in domain-driven design.
 * ---
 * @template T is the underlying type of the `Identifier` (e.g., string, number).
 */
export class Identifier<T> {
  /**
   * ---
   * Internal constructor, use `.create()` factory method instead.
   * ---
   * Creates unique identifier from provided value.
   * ---
   * @param value The value to use as identifier.
   */
  private constructor(private value: T) {
    this.value = value;

    Object.freeze(this);
  }

  /**
   * ---
   * Factory method for safely creating an `Identifier` instance.
   * ---
   * @param value - Optional identifier value.
   */
  static create<T>(value?: T): Result<Identifier<T>, NullishFailure> {
    return Result.ok(value)
      .validate(guardDefined(this.name))
      .map(value => new Identifier(value));
  }

  /**
   * ---
   * Checks whether this `Identifier` is equal to another.
   * ---
   * @param identifier - The `Identifier` to compare against.
   */
  equals(identifier?: Identifier<T>): boolean {
    if (!identifier) {
      return false;
    }

    if (!(identifier instanceof this.constructor)) {
      return false;
    }

    return identifier.toValue() === this.value;
  }

  /**
   * ---
   * Provides a `string` representation of the `Identifier`'s value.
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * ---
   * Provides the `raw` value of the `Identifier`.
   */
  toValue(): T {
    return this.value;
  }
}
