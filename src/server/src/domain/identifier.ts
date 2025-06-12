/**
 * A strongly-typed identifier wrapper that encapsulates a raw value
 * and provides identity comparison and serialization logic.
 *
 * Commonly used to abstract away primitive IDs (like UUIDs or numbers)
 * in domain-driven design.
 *
 * @template `T` is the underlying type of the `Identifier` (e.g., string, number).
 */
export class Identifier<T> {
  constructor(private value: T) {
    if (!value) {
      throw new Error('InvalidIdentifier: Value cannot be null or undefined');
    }

    this.value = value;

    Object.freeze(this);
  }

  /**
   * Checks whether this `Identifier` is equal to another.
   *
   * @param id - The `Identifier` to compare against.
   * @returns `true` if the other `Identifier` is of the same type and has the same value.
   */
  equals(id?: Identifier<T>): boolean {
    if (!id) {
      return false;
    }

    if (!(id instanceof this.constructor)) {
      return false;
    }

    return id.toValue() === this.value;
  }

  /**
   * Provides a `string` representation of the `identifier`'s value.
   *
   * @returns The value converted to a `string`.
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * Provides the `raw` value of the `Identifier`.
   *
   * @returns The underlying value of the `Identifier`.
   */
  toValue(): T {
    return this.value;
  }
}
