import { EmptyIdentifierFailure } from './identifier-errors';
import { Result } from '../../types/result';

/**
 * A strongly-typed identifier wrapper that encapsulates a raw value
 * and provides identity comparison and serialization logic.
 *
 * Commonly used to abstract away primitive IDs (like UUIDs or numbers)
 * in domain-driven design.
 * @template T is the underlying type of the `Identifier` (e.g., string, number).
 */
export class Identifier<T> {
  /**
   * Internal constructor, use `.create()` factory method instead.
   * Creates unique identifier from provided value.
   * @param value The value to use as identifier.
   */
  private constructor(private value: T) {
    this.value = value;

    Object.freeze(this);
  }

  /**
   * Factory method for safely creating an `Identifier` instance.
   * @param value - Optional identifier value.
   * @returns Successful `Result` with a valid `Identifier` instance,
   * failed `Result` with an `EmptyIdentifierFailure` otherwise.
   */
  static create<T>(value?: T): Result<Identifier<T>, EmptyIdentifierFailure> {
    if (!value) {
      return Result.fail(new EmptyIdentifierFailure());
    }

    return Result.ok(new Identifier(value));
  }

  /**
   * Checks whether this `Identifier` is equal to another.
   * @param identifier - The `Identifier` to compare against.
   * @returns `true` if the other `Identifier` is of the same type and has the same value.
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
   * Provides a `string` representation of the `Identifier`'s value.
   * @returns The value converted to a `string`.
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * Provides the `raw` value of the `Identifier`.
   * @returns The underlying value of the `Identifier`.
   */
  toValue(): T {
    return this.value;
  }
}
