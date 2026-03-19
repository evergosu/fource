/* eslint-disable prettier/prettier */
import { type DomainFailure, domainFailure } from '../issues/failure';
import { guardISOString } from '../invariants/string/iso-string';
import { guardDefined } from '../invariants/defined/defined';
import { guardNumber } from '../invariants/number/number';
import { guardString } from '../invariants/string/string';
import { guardDate } from '../invariants/date/date';
import { ValueObject } from './value-object';
import { Result } from '../../types/result';

type Properties = Record<'date', Date>;

/**
 * ---
 * Shape of subclass static side expected by base factory helpers.
 * ---
 * - subclasses must implement a static `._internalCreate(date)` factory.
 */
interface SubClass<U extends Time<U>, F = never> {
  /**
   * ---
   * Construct an instance of the concrete subclass from a `Date`.
   * ---
   * - subclass must implement this and typically call the protected constructor.
   * - kept public to infer widen `Result` types.
   */
  _internalCreate(date: Date, validators?: unknown[]): Result<U, F>;
  name: string;
}

/**
 * ---
 * A base immutable `Value Object` representing a precise point in time.
 * ---
 * - this is intended to be subclassed for domain-specific concepts like
 * `StoryCreatedAt`, `StoryExpiresAt`, etc.
 * ---
 * @template T - Concrete subclass type
 */
export abstract class Time<T extends Time<T>> extends ValueObject<Properties> {
  /**
   * ---
   * Private constructor. Use `.from*()` factory methods instead.
   * ---
   * @param date - The `Date` object to construct a `Time`.
   */
  protected constructor(date: Date) {
    super({ date });
  }

  /** ----------------- STATIC METHODS ----------------- */

  /**
   * ---
   * Create a `Time` instance from a `Date` object.
   * ---
   * @param date - JavaScript `Date` instance.
   * @param validators - Additional arguments for domain-specific validation.
   */
  public static fromDate<U extends Time<U>, F extends DomainFailure>(
    this: SubClass<U, F>,
    date: unknown,
    validators?: unknown[],
  ) {
    return Result.ok(date)
      .validate(guardDefined(this.name))
      .refine(guardDate(this.name))
      .flatMap(value => this._internalCreate(new Date(value.getTime()), validators))
      .matchFailure({ _: TimeFailure(this.name) });
  }

  /**
   * ---
   * Create a `Time` instance from an `ISO 8601` string.
   * ---
   * @param isoString - `ISO` date string.
   * @param validators - Additional arguments for domain-specific validation.
   */
  public static fromISOString<U extends Time<U>, F extends DomainFailure>(
    this: SubClass<U, F>,
    isoString: unknown,
    validators?: unknown[],
  ) {
    return Result.ok(isoString)
      .validate(guardDefined(this.name))
      .refine(guardString(this.name))
      .validate(guardISOString(this.name))
      .flatMap(value => this._internalCreate(new Date(value), validators))
      .matchFailure({ _: TimeFailure(this.name) });
  }

  /**
   * ---
   * Create a `Time` instance from a `Unix` timestamp in milliseconds.
   * ---
   * @param ms - `Unix` time in milliseconds.
   * @param validators - Additional arguments for domain-specific validation.
   */
  public static fromUnixMilliSeconds<U extends Time<U>, F extends DomainFailure>(
    this: SubClass<U, F>,
    ms: unknown,
    validators?: unknown[],
  ) {
    return Result.ok(ms)
      .validate(guardDefined(this.name))
      .refine(guardNumber(this.name))
      .flatMap(value => this._internalCreate(new Date(value), validators))
      .matchFailure({ _: TimeFailure(this.name) });
  }

  /**
   * ---
   * Create a `Time` instance for the current system time.
   * ---
   * @param validators - Additional arguments for domain-specific validation.
   */
  public static fromNow<U extends Time<U>, F extends DomainFailure>(this: SubClass<U, F>, validators?: unknown[]) {
    return this._internalCreate(new Date(), validators);
  }

  /** ----------------- INSTANCE METHODS ----------------- */

  /**
   * ---
   * Get the underlying `Date`.
   */
  public toDate(): Date {
    return new Date(this.properties.date.getTime());
  }

  /**
   * ---
   * Get the time as `ISO` string.
   */
  public toISOString(): string {
    return this.properties.date.toISOString();
  }

  /**
   * ---
   * Get the time as `Unix` timestamp in milliseconds.
   */
  public toUnixMilliSeconds(): number {
    return this.properties.date.getTime();
  }

  /**
   * ---
   * Whether this time is before another.
   * ---
   * @param other The time object to compare with.
   */
  public isBefore<U extends Time<U>>(other: U): boolean {
    return this.toUnixMilliSeconds() < other.toUnixMilliSeconds();
  }

  /**
   * ---
   * Whether this time is after another.
   * ---
   * @param other The time object to compare with.
   */
  public isAfter<U extends Time<U>>(other: U): boolean {
    return this.toUnixMilliSeconds() > other.toUnixMilliSeconds();
  }

  /**
   * ---
   * Whether this time is between two others (exclusive).
   * ---
   * @param start The time object to start from.
   * @param end The time object to end with.
   */
  public isBetween<U extends Time<U>, V extends Time<V>>(start: U, end: V): boolean {
    const ts = this.toUnixMilliSeconds();
    return ts > start.toUnixMilliSeconds() && ts < end.toUnixMilliSeconds();
  }

  /**
   * ---
   * Add milliseconds and return a new instance.
   * ---
   * @param ms a milliseconds to add to current time instance.
   * @param validators - Additional arguments for domain-specific validation.
   */
  public addMilliSeconds<F>(ms: number, validators?: unknown[]): Result<this, F> {
    const ctor = this.constructor as unknown as SubClass<this, F>;

    // Safe because subclass's `.internalCreate()` returns the correct concrete type.
    return ctor._internalCreate(new Date(this.properties.date.getTime() + ms), validators);
  }

  /**
   * ---
   * Subtract milliseconds and return a new instance.
   * ---
   * @param ms a milliseconds to substract from current time instance.
   * @param validators - Additional arguments for domain-specific validation.
   */
  public subtractMilliSeconds<F>(ms: number, validators?: unknown[]): Result<this, F> {
    const ctor = this.constructor as unknown as SubClass<this, F>;

    // Safe because subclass's `.internalCreate()` returns the correct concrete type.
    return ctor._internalCreate(new Date(this.properties.date.getTime() - ms), validators);
  }

  /**
   * ---
   * Equality check based on instant in time.
   * ---
   * @param value - The other `Time` instance to compare against.
   */
  public override equals<U extends Time<U>>(value?: U): boolean {
    if (!value) return false;

    if (!(value instanceof Time)) return false;

    return this.toUnixMilliSeconds() === value.toUnixMilliSeconds();
  }
}

type TimeFailure = {
  readonly cause: DomainFailure;
  readonly _tag: 'TimeFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const TimeFailure =
  (name: string) =>
    (cause: DomainFailure): TimeFailure =>
      domainFailure({
        _tag: 'TimeFailure',
        cause,
        name,
      });
