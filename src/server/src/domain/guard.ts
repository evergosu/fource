import {
  MaximumLengthExceededError,
  MinimumLengthNotMetError,
  NullOrUndefinedError,
  InvalidFormatError,
  InvalidEmailError,
  BlankStringError,
  DateInPastError,
  OutOfRangeError,
  StringError,
} from './domain-error';
import { Result } from './result';

/**
 * `Guard` class offering both static and instance validation methods.
 *
 * Static methods validate individual values with custom field names.
 * Instance methods validate properties of an object, ensuring field names
 * correspond to actual keys of that object at compile time.
 * @template T - Type of the object to be validated by instance methods.
 */
export class Guard<T extends Record<string, unknown> = never> {
  private constructor(private readonly object: T) {}

  /**
   * Factory to create an instance guard for a given object.
   * @param object - Object to be validated.
   * @returns An instance of `Guard` for the object.
   * @example .
   * const user = { email: 'foo@example.com', age: 42 };
   * const guard = Guard.for(user);
   * const result = guard.againstNullOrUndefined('email');
   */
  public static for<T extends Record<string, unknown>>(object: T): Guard<T> {
    return new Guard(object);
  }

  /** ----------------- STATIC METHODS ----------------- */

  /**
   * Validates that a value is neither `null` nor `undefined`.
   * @param value - Value to check.
   * @param field - Name of the field for error reporting.
   * @returns `Result.ok()` if valid; `Result.fail(NullOrUndefinedError)` otherwise.
   * @example Guard.againstNullOrUndefined(null, 'username');
   */
  public static againstNullOrUndefined(
    value: unknown,
    field: string,
  ): Result<void, NullOrUndefinedError> {
    if (value === null || value === undefined) {
      return Result.fail(new NullOrUndefinedError(field));
    }

    return Result.ok();
  }

  /**
   * Validates that value is a `string`.
   * @param value - The value to check.
   * @param name - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(StringError)` otherwise.
   */
  public static againstNotString(
    value: unknown,
    name: string,
  ): Result<void, StringError> {
    if (
      !(
        typeof value === 'string' ||
        Object.prototype.toString.call(value) === '[object String]'
      )
    ) {
      return Result.fail(new StringError(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` is `not` only `whitespace`.
   * @param value - The value to check.
   * @param name - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(BlankStringError)` otherwise.
   */
  public static againstBlankString(
    value: unknown,
    name: string,
  ): Result<void, BlankStringError | StringError> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).trim() === '') {
      return Result.fail(new BlankStringError(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string`'s length is at least a `minimum length`.
   * @param value - The value to check.
   * @param minimumLength - Minimum allowed length.
   * @param name - Field name for error reporting.
   * @returns `Result.ok()` if valid; Result.fail(MinimumLengthNotMetError) otherwise.
   */
  public static againstMinimumLength(
    value: unknown,
    minimumLength: number,
    name: string,
  ): Result<void, MinimumLengthNotMetError | StringError> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).length < minimumLength) {
      return Result.fail(new MinimumLengthNotMetError(name, minimumLength));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string`'s length does not exceed a `maximum length`.
   * @param value - The value to check.
   * @param maximumLength - Maximum allowed length.
   * @param name - Field name for error reporting.
   * @returns `Result.ok()` if valid; `Result.fail(MaximumLengthExceededError)` otherwise.
   */
  public static againstMaximumLength(
    value: unknown,
    maximumLength: number,
    name: string,
  ): Result<void, MaximumLengthExceededError | StringError> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).length > maximumLength) {
      return Result.fail(new MaximumLengthExceededError(name, maximumLength));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` matches the provided `regex` pattern.
   * @param value - The value to check.
   * @param pattern - Regex pattern to match.
   * @param name - Field name for error reporting.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidFormatError)` otherwise.
   */
  public static againstInvalidFormat(
    value: unknown,
    pattern: RegExp,
    name: string,
  ): Result<void, InvalidFormatError | StringError> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if (!pattern.test(value as string)) {
      return Result.fail(new InvalidFormatError(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` is a valid `email address`.
   * @param value - The value to check.
   * @param name - Field name for error reporting.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidEmailError)` otherwise.
   */
  public static againstInvalidEmail(
    value: unknown,
    name: string,
  ): Result<void, InvalidEmailError | StringError> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]{2,}$/;

    if (!emailRegex.test(value as string)) {
      return Result.fail(new InvalidEmailError(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `Date` is `not in the past` (compared to now).
   * @param value - The value to check.
   * @param name - Field name for error reporting.
   * @returns `Result.ok()` if valid; `Result.fail(DateInPastError)` otherwise.
   */
  public static againstDateInPast(
    value: unknown,
    name: string,
  ): Result<void, DateInPastError> {
    if (
      !(value instanceof Date) ||
      Number.isNaN(value.getTime()) ||
      value.getTime() < Date.now()
    ) {
      return Result.fail(new DateInPastError(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `number` is `within` a specified inclusive `range`.
   * @param value - The value to check.
   * @param minimum - Minimum allowed value.
   * @param maximum - Maximum allowed value.
   * @param name - Field name for error reporting.
   * @returns Result.ok() if valid; Result.fail(OutOfRangeError) otherwise.
   */
  public static againstOutOfRange(
    value: unknown,
    minimum: number,
    maximum: number,
    name: string,
  ): Result<void, OutOfRangeError> {
    if (typeof value !== 'number' || value < minimum || value > maximum) {
      return Result.fail(new OutOfRangeError(name, minimum, maximum));
    }

    return Result.ok();
  }

  /** ----------------- INSTANCE METHODS ----------------- */

  /**
   * Validates that a property of the instance object
   * is neither `null` nor `undefined`.
   * @param field - Key of the property to check.
   * @returns `Result.ok()` if valid; `Result.fail(NullOrUndefinedError)` otherwise.
   * @example .
   * const guard = Guard.for({ username: 'bob' });
   * guard.againstNullOrUndefined('username');
   */
  public againstNullOrUndefined(
    field: keyof T,
  ): Result<void, NullOrUndefinedError> {
    const value = this.object[field];

    return Guard.againstNullOrUndefined(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string`.
   * @param field - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(StringError)` otherwise.
   */
  public againstNotString(field: keyof T): Result<void, StringError> {
    const value = this.object[field];

    return Guard.againstNotString(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and `not blank` or contains only `whitespaces`.
   * @param field - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(BlankStringError)` otherwise.
   */
  public againstBlankString(field: keyof T): Result<void, BlankStringError> {
    const value = this.object[field];

    return Guard.againstBlankString(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` with at least of `minimum length`.
   * @param field - Property key to validate.
   * @param minimumLength - Minimum length required.
   * @returns `Result.ok()` if valid; `Result.fail(MinimumLengthNotMetError)` otherwise.
   */
  public againstMinimumLength(
    field: keyof T,
    minimumLength: number,
  ): Result<void, MinimumLengthNotMetError | StringError> {
    const value = this.object[field];

    return Guard.againstMinimumLength(value, minimumLength, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and does not exceed a `maximum length`.
   * @param field - Property key to validate.
   * @param maximumLength - Maximum length allowed.
   * @returns `Result.ok()` if valid; `Result.fail(MaximumLengthExceededError)` otherwise.
   */
  public againstMaximumLength(
    field: keyof T,
    maximumLength: number,
  ): Result<void, MaximumLengthExceededError | StringError> {
    const value = this.object[field];

    return Guard.againstMaximumLength(value, maximumLength, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` that matches a `regex` pattern.
   * @param field - Property key to validate.
   * @param pattern - Regex pattern to match.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidFormatError)` otherwise.
   */
  public againstInvalidFormat(
    field: keyof T,
    pattern: RegExp,
  ): Result<void, InvalidFormatError> {
    const value = this.object[field];

    return Guard.againstInvalidFormat(value, pattern, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and valid `email`.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidEmailError)` otherwise.
   */
  public againstInvalidEmail(field: keyof T): Result<void, InvalidEmailError> {
    const value = this.object[field];

    return Guard.againstInvalidEmail(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `Date` and `not` in the `past`.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(DateInPastError)` otherwise.
   */
  public againstDateInPast(field: keyof T): Result<void, DateInPastError> {
    const value = this.object[field];

    return Guard.againstDateInPast(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `number` within a specified inclusive `range`.
   * @param field - Property key to validate.
   * @param minimum - Minimum allowed value.
   * @param maximum - Maximum allowed value.
   * @returns `Result.ok()` if valid; `Result.fail(OutOfRangeError)` otherwise.
   */
  public againstOutOfRange(
    field: keyof T,
    minimum: number,
    maximum: number,
  ): Result<void, OutOfRangeError> {
    const value = this.object[field];

    return Guard.againstOutOfRange(value, minimum, maximum, field.toString());
  }
}
