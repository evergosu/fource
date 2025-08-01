import { DomainFailure } from '../domain-error';

/**
 * Failure indicating that an identifier can not be
 * created from provided null-ish value.
 */
export class EmptyIdentifierFailure extends DomainFailure {
  /**
   * Creates domain failure with provided error message.
   */
  constructor() {
    super('Can not create identifier from null or undefined value');
  }
}

/**
 * Failure indicating that an identifier can not be
 * created from provided value with empty string.
 */
export class BlankIdentifierFailure extends DomainFailure {
  /**
   * Creates domain failure with provided error message.
   */
  constructor() {
    super('Can not create identifier from empty string value');
  }
}

/**
 * Failure indicating that an identifier can not be
 * created from provided value that is not string or number.
 */
export class StringOrNumberIdentifierFailure extends DomainFailure {
  /**
   * Creates domain failure with provided error message.
   */
  constructor() {
    super('Can not create identifier from a value of invalid type');
  }
}
