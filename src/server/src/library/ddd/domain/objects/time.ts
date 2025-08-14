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

type Properties = Record<'value', Date>;

/**
 * Shape of subclass static side expected by base factory helpers.
 * Subclasses must implement a static `create(date)` factory.
 */
interface TimeStatic<U extends Time<U>> {
  /**
   * Construct an instance of the concrete subclass from a Date.
   * Subclass must implement this and typically call the protected constructor.
   */
  create(date: Date): U;
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
   * Private constructor to enforce the use of factory methods.
   * @param date - The `Date` object to construct `Time`.
   */
  protected constructor(date: Date) {
    super({ value: date });
  }

  /** ----------------- STATIC METHODS ----------------- */

  /**
   * Create a Time instance from a Date object.
   * @param date - JavaScript Date instance.
   */
  public static fromDate<U extends Time<U>>(
    this: TimeStatic<U>,
    date: Date,
  ): Result<U, NullOrUndefinedFailure | DateFailure> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(date, 'date'),
      Guard.againstNotDate(date, 'date'),
    ]);

    return result.map(() => this.create(new Date(date.getTime())));
  }

  /**
   * Create a Time instance from an ISO 8601 string.
   * @param isoString - ISO date string.
   */
  public static fromISOString<U extends Time<U>>(
    this: TimeStatic<U>,
    isoString: string,
  ): Result<U, NullOrUndefinedFailure | ISODateFailure | StringFailure> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(isoString, 'date'),
      Guard.againstISODateString(isoString, 'date'),
    ]);

    return result.map(() => this.create(new Date(isoString)));
  }

  /**
   * Create a Time instance from a Unix timestamp in milliseconds.
   * @param ms - Unix time in milliseconds.
   */
  public static fromUnixMilliSeconds<U extends Time<U>>(
    this: TimeStatic<U>,
    ms: number,
  ): Result<U, NullOrUndefinedFailure | NumberFailure> {
    const result = Result.combine([
      Guard.againstNullOrUndefined(ms, 'date'),
      Guard.againstNotNumber(ms, 'date'),
    ]);

    return result.map(() => this.create(new Date(ms)));
  }

  /**
   * Create a Time instance for the current system time.
   */
  public static fromNow<U extends Time<U>>(this: TimeStatic<U>): Result<U> {
    return Result.ok(this.create(new Date()));
  }

  /** ----------------- INSTANCE METHODS ----------------- */

  /** Get the underlying Date. */
  public toDate(): Date {
    return new Date(this.properties.value.getTime());
  }

  /** Get the time as ISO string. */
  public toISOString(): string {
    return this.properties.value.toISOString();
  }

  /** Get the time as Unix timestamp in milliseconds. */
  public toUnixMilliSeconds(): number {
    return this.properties.value.getTime();
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
  public addMilliSeconds(ms: number): this {
    const ctor = this.constructor as unknown as TimeStatic<this>;

    // Safe because subclass's `create` returns the correct concrete type.
    return ctor.create(new Date(this.properties.value.getTime() + ms));
  }

  /**
   * Subtract milliseconds and return a new instance.
   * @param ms a milliseconds to substract from current time instance.
   */
  public subtractMilliSeconds(ms: number): this {
    const ctor = this.constructor as unknown as TimeStatic<this>;

    // Safe because subclass's `create` returns the correct concrete type.
    return ctor.create(new Date(this.properties.value.getTime() - ms));
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
