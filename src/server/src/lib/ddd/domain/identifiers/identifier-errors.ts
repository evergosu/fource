import { DomainError } from '../domain-error';

/**
 * Error indicating that an identifier can not be
 * created from provided null-ish value.
 */
export class EmptyIdentifierError extends DomainError {
  /**
   * Creates domain error with provided error message.
   */
  constructor() {
    super('Can not create identifier from null or undefined value');
  }
}

/**
 * Error indicating that an identifier can not be
 * created from provided value with empty string.
 */
export class BlankIdentifierError extends DomainError {
  /**
   * Creates domain error with provided error message.
   */
  constructor() {
    super('Can not create identifier from empty string value');
  }
}

/**
 * Error indicating that an identifier can not be
 * created from provided value that is not string or number.
 */
export class StringOrNumberIdentifierError extends DomainError {
  /**
   * Creates domain error with provided error message.
   */
  constructor() {
    super('Can not create identifier from a value of invalid type');
  }
}
