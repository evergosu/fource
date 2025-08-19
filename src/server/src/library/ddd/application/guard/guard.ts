import {
  MaximumLengthExceededFailure,
  MinimumLengthNotMetFailure,
  NullOrUndefinedFailure,
  InvalidFormatFailure,
  InvalidEmailFailure,
  DateInFutureFailure,
  BlankStringFailure,
  DateInPastFailure,
  OutOfRangeFailure,
  DateBeforeFailure,
  DateAfterFailure,
  ISODateFailure,
  StringFailure,
  NumberFailure,
  DateFailure,
} from './guard-errors';
import { Result } from '../../types/result';
// TODO: MOVE TO DOMAIN LAYER.
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
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(NullOrUndefinedFailure)` otherwise.
   * @example Guard.againstNullOrUndefined(null, 'username');
   */
  public static againstNullOrUndefined(
    value: unknown,
    name: string,
  ): Result<void, NullOrUndefinedFailure> {
    if (value === null || value === undefined) {
      return Result.fail(new NullOrUndefinedFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that value is a `number`.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(NumberFailure)` otherwise.
   */
  public static againstNotNumber(
    value: unknown,
    name: string,
  ): Result<void, NumberFailure> {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return Result.fail(new NumberFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that value is a `string`.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(StringFailure)` otherwise.
   */
  public static againstNotString(
    value: unknown,
    name: string,
  ): Result<void, StringFailure> {
    if (
      !(
        typeof value === 'string' ||
        Object.prototype.toString.call(value) === '[object String]'
      )
    ) {
      return Result.fail(new StringFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` is `not` only `whitespace`.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(BlankStringFailure | StringFailure)` otherwise.
   */
  public static againstBlankString(
    value: unknown,
    name: string,
  ): Result<void, BlankStringFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).trim() === '') {
      return Result.fail(new BlankStringFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string`'s length is at least a `minimum length`.
   * @param value - The value to check.
   * @param minimumLength - Minimum allowed length.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; Result.fail(MinimumLengthNotMetFailure | StringFailure) otherwise.
   */
  public static againstMinimumLength(
    value: unknown,
    minimumLength: number,
    name: string,
  ): Result<void, MinimumLengthNotMetFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).length < minimumLength) {
      return Result.fail(new MinimumLengthNotMetFailure(name, minimumLength));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string`'s length does not exceed a `maximum length`.
   * @param value - The value to check.
   * @param maximumLength - Maximum allowed length.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(MaximumLengthExceededFailure | StringFailure)` otherwise.
   */
  public static againstMaximumLength(
    value: unknown,
    maximumLength: number,
    name: string,
  ): Result<void, MaximumLengthExceededFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as string).length > maximumLength) {
      return Result.fail(new MaximumLengthExceededFailure(name, maximumLength));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` matches the provided `regex` pattern.
   * @param value - The value to check.
   * @param pattern - Regex pattern to match.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidFormatFailure | StringFailure)` otherwise.
   */
  public static againstInvalidFormat(
    value: unknown,
    pattern: RegExp,
    name: string,
  ): Result<void, InvalidFormatFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    if (!pattern.test(value as string)) {
      return Result.fail(new InvalidFormatFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `string` is a valid `email address`.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidEmailFailure | StringFailure)` otherwise.
   */
  public static againstInvalidEmail(
    value: unknown,
    name: string,
  ): Result<void, InvalidEmailFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]{2,}$/;

    if (!emailRegex.test(value as string)) {
      return Result.fail(new InvalidEmailFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `Date` is a valid javascript `Date` object.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(DateFailure)` otherwise.
   */
  public static againstNotDate(
    value: unknown,
    name: string,
  ): Result<void, DateFailure> {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return Result.fail(new DateFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a value is a valid ISO 8601 date string.
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(ISODateFailure | StringFailure)` otherwise.
   */
  public static againstISODateString(
    value: unknown,
    name: string,
  ): Result<void, ISODateFailure | StringFailure> {
    const result = Guard.againstNotString(value, name);

    if (result.isFailure) {
      return result;
    }

    // ISO 8601 regex (YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD).
    const iso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

    if (!iso8601Regex.test(value as string)) {
      return Result.fail(new ISODateFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a value is not `before another`.
   * @param date - The value to check.
   * @param target - The value to check against.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(DateBeforeFailure | DateFailure)` otherwise.
   */
  public static againstDateBefore(
    date: unknown,
    target: unknown,
    name: string,
  ): Result<void, DateBeforeFailure | DateFailure> {
    const result = Result.combine([
      Guard.againstNotDate(date, name),
      Guard.againstNotDate(target, name),
    ]);

    if (result.isFailure) {
      return result;
    }

    if ((date as Date).getTime() < (target as Date).getTime()) {
      return Result.fail(
        new DateBeforeFailure(name, (target as Date).toLocaleDateString()),
      );
    }

    return Result.ok();
  }

  /**
   * Validates that a value is not `after another`.
   * @param date - The value to check.
   * @param target - The value to check against.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(DateAfterFailure | DateFailure)` otherwise.
   */
  public static againstDateAfter(
    date: unknown,
    target: unknown,
    name: string,
  ): Result<void, DateAfterFailure | DateFailure> {
    const result = Result.combine([
      Guard.againstNotDate(date, name),
      Guard.againstNotDate(target, name),
    ]);

    if (result.isFailure) {
      return result;
    }

    if ((date as Date).getTime() > (target as Date).getTime()) {
      return Result.fail(
        new DateAfterFailure(name, (target as Date).toLocaleDateString()),
      );
    }

    return Result.ok();
  }

  /**
   * Validates that a value is `not in the past` (compared to now).
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(DateInPastFailure | DateFailure)` otherwise.
   */
  public static againstDateInPast(
    value: unknown,
    name: string,
  ): Result<void, DateInPastFailure | DateFailure> {
    const result = Guard.againstNotDate(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as Date).getTime() < Date.now()) {
      return Result.fail(new DateInPastFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a value is `not in the future` (compared to now).
   * @param value - The value to check.
   * @param name - Name of the field for failure message.
   * @returns `Result.ok()` if valid; `Result.fail(DateInFutureFailure | DateFailure)` otherwise.
   */
  public static againstDateInFuture(
    value: unknown,
    name: string,
  ): Result<void, DateInFutureFailure | DateFailure> {
    const result = Guard.againstNotDate(value, name);

    if (result.isFailure) {
      return result;
    }

    if ((value as Date).getTime() > Date.now()) {
      return Result.fail(new DateInFutureFailure(name));
    }

    return Result.ok();
  }

  /**
   * Validates that a `number` is `within` a specified inclusive `range`.
   * @param value - The value to check.
   * @param minimum - Minimum allowed value.
   * @param maximum - Maximum allowed value.
   * @param name - Name of the field for failure message.
   * @returns Result.ok() if valid; Result.fail(OutOfRangeFailure) otherwise.
   */
  public static againstOutOfRange(
    value: unknown,
    minimum: number,
    maximum: number,
    name: string,
  ): Result<void, OutOfRangeFailure> {
    if (typeof value !== 'number' || value < minimum || value > maximum) {
      return Result.fail(new OutOfRangeFailure(name, minimum, maximum));
    }

    return Result.ok();
  }

  /** ----------------- INSTANCE METHODS ----------------- */

  /**
   * Validates that a property of the instance object
   * is neither `null` nor `undefined`.
   * @param field - Key of the property to check.
   * @returns `Result.ok()` if valid; `Result.fail(NullOrUndefinedFailure)` otherwise.
   * @example .
   * const guard = Guard.for({ username: 'bob' });
   * guard.againstNullOrUndefined('username');
   */
  public againstNullOrUndefined(
    field: keyof T,
  ): Result<void, NullOrUndefinedFailure> {
    const value = this.object[field];

    return Guard.againstNullOrUndefined(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `number`.
   * @param field - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(NumberFailure)` otherwise.
   */
  public againstNotNumber(field: keyof T): Result<void, NumberFailure> {
    const value = this.object[field];

    return Guard.againstNotNumber(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string`.
   * @param field - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(StringFailure)` otherwise.
   */
  public againstNotString(field: keyof T): Result<void, StringFailure> {
    const value = this.object[field];

    return Guard.againstNotString(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and `not blank` or contains only `whitespaces`.
   * @param field - Field name for reporting.
   * @returns `Result.ok()` if valid; `Result.fail(BlankStringFailure)` otherwise.
   */
  public againstBlankString(field: keyof T): Result<void, BlankStringFailure> {
    const value = this.object[field];

    return Guard.againstBlankString(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` with at least of `minimum length`.
   * @param field - Property key to validate.
   * @param minimumLength - Minimum length required.
   * @returns `Result.ok()` if valid; `Result.fail(MinimumLengthNotMetFailure | StringFailure)` otherwise.
   */
  public againstMinimumLength(
    field: keyof T,
    minimumLength: number,
  ): Result<void, MinimumLengthNotMetFailure | StringFailure> {
    const value = this.object[field];

    return Guard.againstMinimumLength(value, minimumLength, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and does not exceed a `maximum length`.
   * @param field - Property key to validate.
   * @param maximumLength - Maximum length allowed.
   * @returns `Result.ok()` if valid; `Result.fail(MaximumLengthExceededFailure | StringFailure)` otherwise.
   */
  public againstMaximumLength(
    field: keyof T,
    maximumLength: number,
  ): Result<void, MaximumLengthExceededFailure | StringFailure> {
    const value = this.object[field];

    return Guard.againstMaximumLength(value, maximumLength, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` that matches a `regex` pattern.
   * @param field - Property key to validate.
   * @param pattern - Regex pattern to match.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidFormatFailure)` otherwise.
   */
  public againstInvalidFormat(
    field: keyof T,
    pattern: RegExp,
  ): Result<void, InvalidFormatFailure> {
    const value = this.object[field];

    return Guard.againstInvalidFormat(value, pattern, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `string` and valid `email`.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(InvalidEmailFailure)` otherwise.
   */
  public againstInvalidEmail(
    field: keyof T,
  ): Result<void, InvalidEmailFailure> {
    const value = this.object[field];

    return Guard.againstInvalidEmail(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a valid javascript `Date` object.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(DateFailure)` otherwise.
   */
  public againstNotDate(field: keyof T): Result<void, DateFailure> {
    const value = this.object[field];

    return Guard.againstNotDate(value, field.toString());
  }

  /**
   * Validates that a value is a valid ISO 8601 date string.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(ISODateFailure | StringFailure)` otherwise.
   */
  public againstISODateString(
    field: keyof T,
  ): Result<void, ISODateFailure | StringFailure> {
    const value = this.object[field];

    return Guard.againstISODateString(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `Date` and is not `before` the `target` date.
   * @param field - Property key to validate.
   * @param target - The value to check against.
   * @returns `Result.ok()` if valid; `Result.fail(DateBeforeFailure | DateFailure)` otherwise.
   */
  public againstDateBefore(
    field: keyof T,
    target: unknown,
  ): Result<void, DateBeforeFailure | DateFailure> {
    const value = this.object[field];

    return Guard.againstDateBefore(value, target, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `Date` and is not `after` the `target` date.
   * @param field - Property key to validate.
   * @param target - The value to check against.
   * @returns `Result.ok()` if valid; `Result.fail(DateAfterFailure | DateFailure)` otherwise.
   */
  public againstDateAfter(
    field: keyof T,
    target: unknown,
  ): Result<void, DateAfterFailure | DateFailure> {
    const value = this.object[field];

    return Guard.againstDateAfter(value, target, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `Date` and `not` in the `past`.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(DateInPastFailure | DateFailure)` otherwise.
   */
  public againstDateInPast(
    field: keyof T,
  ): Result<void, DateInPastFailure | DateFailure> {
    const value = this.object[field];

    return Guard.againstDateInPast(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `Date` and `not` in the `future`.
   * @param field - Property key to validate.
   * @returns `Result.ok()` if valid; `Result.fail(DateInFutureFailure | DateFailure)` otherwise.
   */
  public againstDateInFuture(
    field: keyof T,
  ): Result<void, DateInFutureFailure | DateFailure> {
    const value = this.object[field];

    return Guard.againstDateInFuture(value, field.toString());
  }

  /**
   * Validates that a property of the instance object
   * is a `number` within a specified inclusive `range`.
   * @param field - Property key to validate.
   * @param minimum - Minimum allowed value.
   * @param maximum - Maximum allowed value.
   * @returns `Result.ok()` if valid; `Result.fail(OutOfRangeFailure)` otherwise.
   */
  public againstOutOfRange(
    field: keyof T,
    minimum: number,
    maximum: number,
  ): Result<void, OutOfRangeFailure> {
    const value = this.object[field];

    return Guard.againstOutOfRange(value, minimum, maximum, field.toString());
  }
}
