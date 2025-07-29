/**
 * Base class for all domain-specific errors.
 *
 * Domain errors represent business rule violations, invariant failures,
 * or invalid states discovered during domain model validation.
 *
 * All domain errors are safe for clients to consume, loggable, and can be localized.
 * Using `Object.setPrototypeOf(this, new.target.prototype)` is necessary to fix prototype chain issues
 * when extending built-in Error in TypeScript.
 */
export abstract class DomainError extends Error {
  /**
   * Creates a new instance of DomainError.
   * @param message The descriptive error message explaining the failure.
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Guarantees that instanceof works properly and allows safe and consistent inheritance.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error indicating that a required value is null or undefined.
 * @example throw new NullOrUndefinedError('username')
 */
export class NullOrUndefinedError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value that was null or undefined.
   * @example throw new NullOrUndefinedError('username');
   */
  constructor(public readonly value: string) {
    super(`${value} is null or undefined`);
  }
}

/**
 * Error indicating that a value is not a string.
 * @example throw new StringError(42);
 */
export class StringError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is not a string`);
  }
}

/**
 * Error indicating that a string
 * is blank or contains only whitespaces.
 * @example throw new BlankStringError('username');
 */
export class BlankStringError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is a blank string or contains only whitespaces`);
  }
}

/**
 * Error indicating that a string exceeded its allowed maximum length.
 * @example throw new MaximumLengthExceededError('username', 50);
 */
export class MaximumLengthExceededError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value being validated.
   * @param maximumLength The maximum allowed length.
   */
  constructor(
    public readonly value: string,
    public readonly maximumLength: number,
  ) {
    super(`${value} exceeds maximum length of ${maximumLength.toString()}`);
  }
}

/**
 * Error indicating that a string failed to meet the minimum required length.
 * @example throw new MinimumLengthNotMetError('password', 8);
 */
export class MinimumLengthNotMetError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value being validated.
   * @param minimumLength The minimum required length.
   */
  constructor(
    public readonly value: string,
    public readonly minimumLength: number,
  ) {
    super(`${value} must be at least ${minimumLength.toString()} characters`);
  }
}

/**
 * Error indicating that a string failed to match a required format or pattern.
 * Typically used for validating format constraints via regular expressions.
 * @example throw new InvalidFormatError('phoneNumber');
 */
export class InvalidFormatError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value that failed format validation.
   */
  constructor(public readonly value: string) {
    super(`${value} has invalid format`);
  }
}

/**
 * Error indicating that a string is not a valid email address.
 * @example throw new InvalidEmailError('email');
 */
export class InvalidEmailError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the email value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} must be a valid email`);
  }
}

/**
 * Error indicating that a date value occurs in the past when future or present dates are required.
 * @example throw new DateInPastError('expirationDate');
 */
export class DateInPastError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the date value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} cannot be in the past`);
  }
}

/**
 * Error indicating that a numeric value falls outside the permitted inclusive range.
 * @example throw new OutOfRangeError('age', 18, 65);
 */
export class OutOfRangeError extends DomainError {
  /**
   * Creates domain error with provided error message.
   * @param value The name of the value being validated.
   * @param minimum The minimum inclusive boundary.
   * @param maximum The maximum inclusive boundary.
   */
  constructor(
    public readonly value: string,
    public readonly minimum: number,
    public readonly maximum: number,
  ) {
    super(
      `${value} must be between ${minimum.toString()} and ${maximum.toString()}`,
    );
  }
}
