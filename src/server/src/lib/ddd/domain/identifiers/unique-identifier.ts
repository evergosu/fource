import { v7 } from 'uuid';

import {
  StringOrNumberIdentifierError,
  BlankIdentifierError,
} from './identifier-errors';
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
export class UniqueIdentifier extends Identifier<string | number> {
  /**
   * Internal constructor. Use `UniqueIdentifier.create()` instead.
   * @param id - Optional identifier value.
   * @throws {BlankIdentifierError} if string value is empty.
   * @throws {StringOrNumberIdentifierError} if value is not string or number.
   */
  private constructor(id?: string | number) {
    if (id !== undefined) {
      if (typeof id === 'string' && id.trim() === '') {
        throw new BlankIdentifierError();
      }

      if (typeof id !== 'string' && typeof id !== 'number') {
        throw new StringOrNumberIdentifierError();
      }
    }

    super(id ?? v7());
  }

  /**
   * Factory method for safely creating a `UniqueIdentifier` instance.
   * @param id - Optional identifier value.
   * @returns A valid `UniqueIdentifier` instance.
   */
  static create(id?: string | number): UniqueIdentifier {
    return new UniqueIdentifier(id);
  }
}
