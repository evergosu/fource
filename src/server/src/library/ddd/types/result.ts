import type { Failure } from '../issues/failure';

import { DataTypeInvariantViolationException } from './type-error';

/**
 * A functional object representing the result of an operation,
 * which can either succeed (`ok`) or fail (`fail`), but never both.
 *
 * This class enforces correct usage via private constructor and static factory methods.
 * Commonly used in Domain-Driven Design, Functional Programming, and Error Handling patterns.
 * @template T - Type of the value when operation succeeds.
 * @template E - Type of the error when operation fails (defaults to `Failure`).
 */
export class Result<T, E = Failure> {
  private readonly _error: undefined | E;
  private readonly _value: undefined | T;
  private readonly _isSuccess: boolean;

  /**
   * Internal constructor. Use `Result.ok()` or `Result.fail()` to create instances.
   * Ensures invariants:
   * - Success cannot contain an error.
   * - Failure must contain an error.
   * @param isSuccess - Whether the result represents success.
   * @param error - Error value (required for failures).
   * @param value - Success value (optional for successes).
   */
  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error !== undefined) {
      throw new DataTypeInvariantViolationException(
        'Cannot contain an error in the successful result',
      );
    }

    if (!isSuccess && error === undefined) {
      throw new DataTypeInvariantViolationException(
        'Must contain an error in the failed result',
      );
    }

    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Creates a Result from a boolean condition.
   * @param condition Boolean value that determines success or failure.
   * @param fail Failure to return in case of failure.
   * @param ok Value to return in case of success.
   */
  static fromBoolean<T, E>(condition: boolean, fail: E, ok?: T): Result<T, E> {
    // eslint-disable-next-line sonarjs/no-selector-parameter
    return condition ? Result.ok(ok) : Result.fail(fail);
  }

  /**
   * Wraps a function call, capturing any thrown exception as `Result.fail()`.
   * @param f - The function to try.
   * @param onError - The function to invoke on error state.
   * @returns A `Result.ok()` on success, `Result.fail()` otherwise.
   */
  public static fromThrowable<T, E>(
    f: () => T,
    onError: (error: unknown) => E,
  ): Result<T, E> {
    try {
      return Result.ok(f());
    } catch (error) {
      return Result.fail(onError(error));
    }
  }

  /**
   * Combine multiple results into a single result.
   * - If any result failed, returns the first failure.
   * - Otherwise, returns success.
   *
   * Useful for validating multiple independent operations.
   * @param results - Array of results to combine.
   * @returns Combined `Result` with inferred errors union.
   */
  static combine<
    T extends readonly Result<unknown, Errors>[],
    Errors = {
      [K in keyof T]: T[K] extends Result<unknown, infer V> ? V : never;
    }[number],
  >(results: [...T]): Result<void, Errors> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }

    return Result.ok();
  }

  /**
   * Applies an asynchronous transformation function to the successful value of the result,
   * returning a new successful result. If the current result is a failure, the same failure is returned.
   * @template U - The type of the value in the new result.
   * @param f - An asynchronous function to transform the successful value.
   * @returns A promise resolving to a `Result<U, E>`, either the transformed success or the same failure.
   */
  public async mapAsync<U>(f: (value: T) => Promise<U>): Promise<Result<U, E>> {
    return this.isSuccess
      ? Result.ok(await f(this.value))
      : Result.fail(this.error);
  }

  /**
   * Applies an asynchronous transformation function that returns a `Result` to the successful value
   * of the result. If the current result is a failure, the same failure is returned.
   *
   * This is useful for chaining asynchronous operations that can also fail.
   * @template U - The type of the value in the new result.
   * @param f - An asynchronous function that takes the successful value and returns a `Result<U, E>`.
   * @returns A promise resolving to a new `Result<U, E>`, or the current failure.
   */
  public async flatMapAsync<U>(
    f: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return this.isSuccess ? await f(this.value) : Result.fail(this.error);
  }

  /**
   * Applies a synchronous transformation function that returns a `Result` to the successful value
   * of the result. If the current result is a failure, the same failure is returned.
   *
   * This is useful for chaining operations that may return a result indicating failure.
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a `Result<U, E>`.
   * @returns A new `Result<U, E>`, or the current failure.
   */
  public flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess ? f(this.value) : Result.fail(this.error);
  }

  /**
   * Applies a synchronous transformation function that returns a `Result` to the successful value
   * of the result. If the current result is a failure, the same failure is returned,
   * if function returns another error type, widened error returned.
   *
   * This is useful for chaining operations that may return a result indicating failure.
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a `Result<U, E>`.
   * @returns A new `Result<U, E | E2>`, or the current failure.
   */
  public flatMapWiden<U, E2>(
    f: (value: T) => Result<U, E2>,
  ): Result<U, E2 | E> {
    return this.isSuccess ? f(this.value) : Result.fail<E2 | E>(this.error);
  }

  /**
   * Applies a synchronous transformation function to the successful value of the result,
   * returning a new successful result. If the current result is a failure, the same failure is returned.
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a new value.
   * @returns A new `Result<U, E>` containing the transformed value, or the current failure.
   */
  public map<U>(f: (value: T) => U): Result<U, E> {
    return this.isSuccess ? Result.ok(f(this.value)) : Result.fail(this.error);
  }

  /**
   * Applies a synchronous transformation function to the error of the
   * result, returning a new failed result. If the current result is
   * successful, the same successful result is returned.
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the error into a new value.
   * @returns A new `Result<T, U>` containing the transformed error, or the current success.
   */
  public mapError<U>(f: (error: E) => U): Result<T, U> {
    return this.isFailure ? Result.fail(f(this.error)) : Result.ok(this.value);
  }

  /**
   * Create a failed result.
   * @param error - Error payload.
   * @returns Failure result.
   */
  public static fail<F = string>(error: F): Result<never, F> {
    return new Result<never, F>(false, error);
  }

  /**
   * Create a successful result.
   * @param value - Success payload (optional).
   * @returns Success result.
   */
  public static ok<U = void>(value?: U): Result<U, never> {
    return new Result<U, never>(true, undefined, value);
  }

  /**
   * Retrieve the error value.
   * Throws if called on a success result.
   * @returns Error payload.
   * @throws {DataTypeInvariantViolationException} if result is successful.
   */
  public get error(): E {
    if (this._isSuccess) {
      throw new DataTypeInvariantViolationException(
        `Cannot get the error of a successful result with a value: ${String(this.value)}`,
      );
    }

    return this._error as E;
  }

  /**
   * Retrieve the success value.
   * Throws if called on a failure result.
   * @returns Success payload.
   * @throws {DataTypeInvariantViolationException} if result is a failure.
   */
  public get value(): T {
    if (!this._isSuccess) {
      throw new DataTypeInvariantViolationException(
        `Cannot get the value of a failed result with an error: ${String(this.error)}`,
      );
    }

    return this._value as T;
  }

  /**
   * Folds (reduces) the Result into a single value by providing handlers for both Value and Error.
   * @param onSuccess - The function to handle the Success case.
   * @param onFailure - The function to handle the Failure case.
   * @returns The result of applying the appropriate handler.
   */
  public fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isSuccess ? onSuccess(this.value) : onFailure(this.error);
  }

  /**
   * Whether the result represents failure.
   * @returns failure flag of the result.
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Whether the result represents success.
   * @returns success flag of the result.
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * Retrieves current value if `Result` is successful, fallback otherwise.
   * @param fallback The fallback value.
   * @returns the contained value or the provided fallback.
   */
  public getOrElse(fallback: T): T {
    return this.isSuccess ? this.value : fallback;
  }

  /**
   * Retrieves current value if `Result` is successful, invokes fallback otherwise.
   * @param getFallback The fallback function to invoke.
   * @returns the contained value or the provided fallback.
   */
  public getOrElseLazy(getFallback: () => T): T {
    return this.isSuccess ? this.value : getFallback();
  }

  /**
   * Serializes current `Result` for logging purpose.
   *@returns A formatted string.
   */
  public toString(): string {
    return this.isSuccess
      ? `Success(${JSON.stringify(this.value)})`
      : `Failure(${JSON.stringify(this.error)})`;
  }

  /**
   * Adds better Node.js debugging support.
   * @returns serialized `Result` values.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}
