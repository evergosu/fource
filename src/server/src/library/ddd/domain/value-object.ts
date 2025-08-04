import { deepCompare } from '../utility/deep-compare';
import { deepFreeze } from '../utility/deep-freeze';

type Properties = Record<string, unknown>;

/**
 * Base class representing a `ValueObject` with a structural definition.
 *
 * `ValueObjects` are defined by their properties rather than identity.
 * Two `ValueObjects` are considered equal if all their properties are equal.
 * @template T is a shape representing the structure of the `ValueObject`'s properties.
 */
export abstract class ValueObject<T extends Properties> {
  /**
   * Constructs a new `ValueObject` instance.
   * @param properties - The structural properties that define the `ValueObject`.
   */
  constructor(public readonly properties: T) {
    this.properties = deepFreeze({ ...properties });
  }

  /**
   * Type guard to check whether a given value is an instance of an `ValueObject`.
   * @param value - The value to check.
   * @returns `true` if the value is an `ValueObject`, `false` otherwise.
   */
  public static isValueObject(value: unknown): value is ValueObject<never> {
    return value instanceof ValueObject;
  }

  /**
   * Compares this `ValueObject` with another for structural equality.
   * @param value - The other `ValueObject` instance to compare against.
   * @returns `true` if all properties match, `false` otherwise.
   */
  public equals(value?: ValueObject<T>): boolean {
    if (!value) return false;

    if (this === value) return true;

    if (!(value instanceof ValueObject)) return false;

    return deepCompare(this.properties, value.properties);
  }
}
