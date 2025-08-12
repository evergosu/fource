import { v7 } from 'uuid';

import {
  StringOrNumberIdentifierFailure,
  BlankIdentifierFailure,
  EmptyIdentifierFailure,
} from './identifier-errors';
import { Result } from '../../types/result';
import { Identifier } from './identifier';

/**
 * A strongly-typed, globally unique identifier for domain entities.
 *
 * This class extends the base `Identifier` value object, providing:
 * - Strong runtime validation
 * - Type-safe encapsulation of identifiers
 * - Optional auto-generation using UUIDv7 when no ID is provided
 *
 * Use `UniqueIdentifier` to avoid primitive obsession when modeling entity identities.
 *
 * Valid ID values:
 * - A non-empty `string` (e.g. UUID, external identifier)
 * - A `number` (e.g. database-generated numeric ID)
 * - If no ID is provided, a UUIDv7 is automatically generated.
 * @example .
 * const id1 = UniqueIdentifier.create(); // auto-generate UUIDv7
 * const id2 = UniqueIdentifier.create('abc-123'); // provide string ID
 * const id3 = UniqueIdentifier.create(123); // provide numeric ID
 */
export class UniqueIdentifier {
  /**
   * Internal constructor. Use `UniqueIdentifier.create()` instead.
   * @param identifier - The underlying `Identifier` instance.
   */
  private constructor(
    private readonly identifier: Identifier<string | number>,
  ) {}

  /**
   * Type-safe overload for default `UniqueIdentifier`.
   */
  static create(): Result<UniqueIdentifier, never>;
  /**
   * Type-safe overload for rehydrated `UniqueIdentifier`.
   */
  static create(
    value: string | number,
  ): Result<
    UniqueIdentifier,
    | StringOrNumberIdentifierFailure
    | EmptyIdentifierFailure
    | BlankIdentifierFailure
  >;
  /**
   * Factory method for safely creating an `UniqueIdentifier` instance.
   * Provides `UUIDv7` if called without arguments.
   * @param value - Optional identifier value.
   * @returns Successful `Result` with a valid `UniqueIdentifier` instance,
   * failed `Result` with an
   * `StringOrNumberIdentifierFailure | EmptyIdentifierFailure | BlankIdentifierFailure`
   * otherwise.
   */
  static create(
    value: string | number = v7(),
  ): Result<
    UniqueIdentifier,
    | StringOrNumberIdentifierFailure
    | EmptyIdentifierFailure
    | BlankIdentifierFailure
  > {
    if (typeof value === 'string' && value.trim() === '') {
      return Result.fail(new BlankIdentifierFailure());
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      return Result.fail(new StringOrNumberIdentifierFailure());
    }

    return Identifier.create(value).map(
      identifier => new UniqueIdentifier(identifier),
    );
  }

  /**
   * Checks whether this `UniqueIdentifier` is equal to another.
   * @param identifier - The `UniqueIdentifier` to compare against.
   * @returns `true` if the other `UniqueIdentifier` is of the same type and has the same value.
   */
  equals(identifier?: UniqueIdentifier): boolean {
    return this.identifier.equals(identifier?.identifier);
  }

  /**
   * Provides a `string` representation of the `UniqueIdentifier`'s value.
   * @returns The value converted to a `string`.
   */
  toString(): string {
    return this.identifier.toString();
  }

  /**
   * Provides the `raw` value of the `UniqueIdentifier`.
   * @returns The underlying value of the `UniqueIdentifier`.
   */
  toValue(): string | number {
    return this.identifier.toValue();
  }
}
