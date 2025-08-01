import { DataTypeInvariantViolationError } from './adt-error';

/**
 * Represents an optional value: every Option is either Some and contains a value, or None, and does not.
 *
 * Similar to Rust's Option or Scala's Option/Maybe.
 *
 * This is useful to avoid `null`/`undefined` and express absence safely.
 * @template T - The type of the value.
 */
export abstract class Option<T> {
  /**
   * Creates an Option containing a value.
   * @param value The value to wrap.
   * @returns new instance of the Some class representing a value.
   * @throws {DataTypeInvariantViolationError} if called with nullish value.
   */
  public static some<T>(value: T): Option<T> {
    // eslint-disable-next-line sonarjs/different-types-comparison
    if (value === null || value === undefined) {
      throw new DataTypeInvariantViolationError(
        'Cannot wrap null or undefined with Option.some',
      );
    }

    return new Some(value);
  }

  /**
   * Creates an Option with no value.
   * @returns new instance of the None class representing a lack of value.
   */
  public static none<T = never>(): Option<T> {
    return new None();
  }

  /**
   * Creates an Option from a nullable value.
   * @param value A potentially nullable value.
   * @returns None if value is null or undefined.
   */
  public static from<T>(value: undefined | null | T): Option<T> {
    return value === null || value === undefined
      ? Option.none()
      : // eslint-disable-next-line unicorn/no-array-callback-reference
        Option.some(value);
  }

  /**
   * Whether the option contains a value.
   */
  public abstract isSome(): this is Some<T>;

  /**
   * Whether the option contains no value.
   */
  public abstract isNone(): this is None;

  /**
   * Prefer `getOrElse` to avoid exceptions.
   * @returns the contained value, or throws if it's None.
   */
  public abstract get(): T;

  /**
   * @param fallback The fallback value.
   * @returns the contained value or the provided fallback.
   */
  public abstract getOrElse(fallback: T): T;

  /**
   * @param getFallback The fallback function.
   * @returns the contained value or the provided fallback.
   */
  public abstract getOrElseLazy(getFallback: () => T): T;

  /**
   * Maps the contained value using a function, if present.
   * @param f Mapping function.
   */
  public abstract map<U>(f: (value: T) => U): Option<U>;

  /**
   * Maps the contained value to another Option.
   * @param f Function returning another Option.
   */
  public abstract flatMap<U>(f: (value: T) => Option<U>): Option<U>;

  /**
   * Matches on Option.
   * @param handlers - An object with `some` and `none` branches.
   */
  public abstract fold<U>(handlers: {
    some: (value: T) => U;
    none: () => U;
  }): U;

  /**
   * Serializes current `Option` for logging purpose.
   *@returns A formatted string.
   */
  public toString(): string {
    return this.isSome() ? `Some(${JSON.stringify(this.get())})` : `None()`;
  }

  /**
   * Adds better Node.js debugging support.
   * @returns serialized `Option` values.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}

class Some<T> extends Option<T> {
  constructor(private readonly value: T) {
    super();
    Object.freeze(this);
  }

  public fold<U>(handlers: { some: (value: T) => U; none: () => U }): U {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    return handlers.some(this.value);
  }

  public map<U>(f: (value: T) => U): Option<U> {
    return Option.some(f(this.value));
  }

  public flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    return f(this.value);
  }

  public getOrElseLazy(_fallback: () => T): T {
    return this.value;
  }

  public getOrElse(_fallback: T): T {
    return this.value;
  }

  public isSome(): this is Some<T> {
    return true;
  }

  public isNone(): this is None {
    return false;
  }

  public get(): T {
    return this.value;
  }
}

class None extends Option<never> {
  constructor() {
    super();
    Object.freeze(this);
  }

  public fold<U>(handlers: { some: (value: never) => U; none: () => U }): U {
    return handlers.none();
  }

  public get(): never {
    throw new DataTypeInvariantViolationError('Cannot call unwrap on None');
  }

  public flatMap<U>(_: (value: never) => Option<U>): Option<U> {
    return this;
  }

  public getOrElseLazy<U>(fallback: () => U): U {
    return fallback();
  }

  public map<U>(_: (value: never) => U): Option<U> {
    return this;
  }

  public getOrElse<U>(fallback: U): U {
    return fallback;
  }

  public isSome(): this is Some<never> {
    return false;
  }

  public isNone(): this is None {
    return true;
  }
}
