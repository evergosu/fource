import { ApplicationFailure } from '../application-error';

/**
 * Failure indicating that a required value is null or undefined.
 */
export class NullOrUndefinedFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value that was null or undefined.
   */
  constructor(public readonly value: string) {
    super(`${value} is null or undefined`);
  }
}

/**
 * Failure indicating that a value is not a number.
 */
export class NumberFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is not a number`);
  }
}

/**
 * Failure indicating that a value is not a string.
 */
export class StringFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is not a string`);
  }
}

/**
 * Failure indicating that a string
 * is blank or contains only whitespaces.
 */
export class BlankStringFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is a blank string or contains only whitespaces`);
  }
}

/**
 * Failure indicating that a string exceeded its allowed maximum length.
 */
export class MaximumLengthExceededFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
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
 * Failure indicating that a string failed to meet the minimum required length.
 */
export class MinimumLengthNotMetFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
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
 * Failure indicating that a string failed to match a required format or pattern.
 * Typically used for validating format constraints via regular expressions.
 */
export class InvalidFormatFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value that failed format validation.
   */
  constructor(public readonly value: string) {
    super(`${value} has invalid format`);
  }
}

/**
 * Failure indicating that a string is not a valid email address.
 */
export class InvalidEmailFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the email value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} must be a valid email`);
  }
}

/**
 * Failure indicating that a value is not a valid Date object.
 */
export class DateFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is not a valid Date object`);
  }
}

/**
 * Failure indicating that a value is not a valid ISO 8601 string.
 */
export class ISODateFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} is not a valid ISO 8601 string`);
  }
}

/**
 * Failure indicating that a date value occurs in the past when future or present dates are required.
 */
export class DateInPastFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the date value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} cannot be in the past`);
  }
}

/**
 * Failure indicating that a date value occurs in the future when past or present dates are required.
 */
export class DateInFutureFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
   * @param value The name of the date value being validated.
   */
  constructor(public readonly value: string) {
    super(`${value} cannot be in the future`);
  }
}

/**
 * Failure indicating that a numeric value falls outside the permitted inclusive range.
 */
export class OutOfRangeFailure extends ApplicationFailure {
  /**
   * Creates application failure with provided error message.
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
