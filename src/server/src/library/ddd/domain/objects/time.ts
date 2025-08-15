import {
  NullOrUndefinedFailure,
  ISODateFailure,
  StringFailure,
  NumberFailure,
  DateFailure,
} from '../../errors';
import { Guard } from '../../application/guard/guard';
import { ValueObject } from './value-object';
import { Result } from '../../types/result';

type Properties = Record<'date', Date>;

/**
 * Shape of subclass static side expected by base factory helpers.
 * Subclasses must implement a static `.internalCreate(date)` factory.
 */
interface SubClass<U extends Time<U>, F = never> {
  /**
   * Construct an instance of the concrete subclass from a Date.
   * Subclass must implement this and typically call the protected constructor.
   * Note: kept public to infer widen `Result` types.
   */
  internalCreate(date: Date): Result<U, F>;
}

/**
 * A base immutable Value Object representing a precise point in time.
 *
 * This is intended to be subclassed for domain-specific concepts like
 * `StoryCreatedAt`, `StoryExpiresAt`, etc.
 * @template T - Concrete subclass type
 */
export abstract class Time<T extends Time<T>> extends ValueObject<Properties> {
  /**
   * Private constructor. Use `.from*()` factory methods instead.
   * @param date - The `Date` object to construct `Time`.
   */
  protected constructor(date: Date) {
    super({ date });
  }

  /** ----------------- STATIC METHODS ----------------- */

  /**
   * Create a Time instance from a Date object.
   * @param date - JavaScript Date instance.
   */
  public static fromDate<U extends Time<U>, F>(
    this: SubClass<U, F>,
    date: Date,
  ): Result<U, FromDateFailures | F> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(date, 'date'),
      Guard.againstNotDate(date, 'date'),
    ]);

    if (result.isFailure) {
      return Result.fail<U, FromDateFailures | F>(result.error);
    }

    return this.internalCreate(new Date(date.getTime()));
  }

  /**
   * Create a Time instance from an ISO 8601 string.
   * @param isoString - ISO date string.
   */
  public static fromISOString<U extends Time<U>, F>(
    this: SubClass<U, F>,
    isoString: string,
  ): Result<U, FromISOStringFailures | F> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(isoString, 'date'),
      Guard.againstISODateString(isoString, 'date'),
    ]);

    if (result.isFailure) {
      return Result.fail<U, FromISOStringFailures | F>(result.error);
    }

    return this.internalCreate(new Date(isoString));
  }

  /**
   * Create a Time instance from a Unix timestamp in milliseconds.
   * @param ms - Unix time in milliseconds.
   */
  public static fromUnixMilliSeconds<U extends Time<U>, F>(
    this: SubClass<U, F>,
    ms: number,
  ): Result<U, FromUnixMsFailures | F> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(ms, 'date'),
      Guard.againstNotNumber(ms, 'date'),
    ]);

    if (result.isFailure) {
      return Result.fail<U, FromUnixMsFailures | F>(result.error);
    }

    return this.internalCreate(new Date(ms));
  }

  /**
   * Create a Time instance for the current system time.
   */
  public static fromNow<U extends Time<U>, F>(
    this: SubClass<U, F>,
  ): Result<U, F> {
    return this.internalCreate(new Date());
  }

  /** ----------------- INSTANCE METHODS ----------------- */

  /** Get the underlying Date. */
  public toDate(): Date {
    return new Date(this.properties.date.getTime());
  }

  /** Get the time as ISO string. */
  public toISOString(): string {
    return this.properties.date.toISOString();
  }

  /** Get the time as Unix timestamp in milliseconds. */
  public toUnixMilliSeconds(): number {
    return this.properties.date.getTime();
  }

  /**
   * Whether this time is before another.
   * @param other The time object to compare with.
   */
  public isBefore<U extends Time<U>>(other: U): boolean {
    return this.toUnixMilliSeconds() < other.toUnixMilliSeconds();
  }

  /**
   * Whether this time is after another.
   * @param other The time object to compare with.
   */
  public isAfter<U extends Time<U>>(other: U): boolean {
    return this.toUnixMilliSeconds() > other.toUnixMilliSeconds();
  }

  /**
   * Whether this time is between two others (exclusive).
   * @param start The time object to start from.
   * @param end The time object to end with.
   */
  public isBetween<U extends Time<U>, V extends Time<V>>(
    start: U,
    end: V,
  ): boolean {
    const ts = this.toUnixMilliSeconds();
    return ts > start.toUnixMilliSeconds() && ts < end.toUnixMilliSeconds();
  }

  /**
   * Add milliseconds and return a new instance.
   * @param ms a milliseconds to add to current time instance.
   */
  public addMilliSeconds<F>(ms: number): Result<this, F> {
    const ctor = this.constructor as unknown as SubClass<this>;

    // Safe because subclass's `.internalCreate()` returns the correct concrete type.
    return ctor.internalCreate(new Date(this.properties.date.getTime() + ms));
  }

  /**
   * Subtract milliseconds and return a new instance.
   * @param ms a milliseconds to substract from current time instance.
   */
  public subtractMilliSeconds<F>(ms: number): Result<this, F> {
    const ctor = this.constructor as unknown as SubClass<this>;

    // Safe because subclass's `.internalCreate()` returns the correct concrete type.
    return ctor.internalCreate(new Date(this.properties.date.getTime() - ms));
  }

  /**
   * Equality check based on instant in time.
   * @param value - The other `Time` instance to compare against.
   */
  public override equals<U extends Time<U>>(value?: U): boolean {
    if (!value) return false;

    if (!(value instanceof Time)) return false;

    return this.toUnixMilliSeconds() === value.toUnixMilliSeconds();
  }
}

type FromUnixMsFailures = NullOrUndefinedFailure | NumberFailure;

type FromDateFailures = NullOrUndefinedFailure | DateFailure;

type FromISOStringFailures =
  | NullOrUndefinedFailure
  | ISODateFailure
  | StringFailure;
