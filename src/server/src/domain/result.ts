import type { DomainError } from './domain-error';

/**
 * A functional object representing the result of an operation,
 * which can either succeed (`ok`) or fail (`fail`), but never both.
 *
 * This class enforces correct usage via private constructor and static factory methods.
 * Commonly used in Domain-Driven Design, Functional Programming, and Error Handling patterns.
 *
 * @template T - Type of the value when operation succeeds.
 * @template E - Type of the error when operation fails (defaults to `string` or `DomainError`).
 */
export class Result<T, E = DomainError | string> {
  private readonly _error: undefined | E;
  private readonly _value: undefined | T;
  private readonly _isSuccess: boolean;

  /**
   * Internal constructor. Use `Result.ok()` or `Result.fail()` to create instances.
   * Ensures invariants:
   * - Success cannot contain an error.
   * - Failure must contain an error.
   *
   * @param isSuccess - Whether the result represents success.
   * @param error - Error value (required for failures).
   * @param value - Success value (optional for successes).
   */
  private constructor(isSuccess: boolean, error?: E, value?: T) {
    if (isSuccess && error !== undefined) {
      throw new InvariantViolationError(
        'InvalidResult: A result cannot be successful and contain an error',
      );
    }

    if (!isSuccess && error === undefined) {
      throw new InvariantViolationError(
        'InvalidResult: A failing result must contain an error',
      );
    }

    this._isSuccess = isSuccess;
    this._error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Combine multiple results into a single result.
   * - If any result failed, returns the first failure.
   * - Otherwise, returns success.
   *
   * Useful for validating multiple independent operations.
   *
   * @param results - Array of results to combine.
   * @returns Combined result.
   */
  public static combine<E>(results: Result<unknown, E>[]): Result<void, E> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.getError());
      }
    }

    return Result.ok();
  }

  /**
   * Combine multiple results into a single result.
   * - If any result failed, returns the first failure.
   * - Otherwise, returns success with list of values.
   *
   * @param results - Array of results to combine.
   * @returns Combined result with values from each result.
   */
  static combineList<
    ErrorType,
    T extends readonly Result<unknown, ErrorType>[],
    OkTypes = {
      [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
    },
  >(results: [...T]): Result<OkTypes, ErrorType> {
    const values: unknown[] = [];

    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.getError());
      }

      values.push(result.getValue());
    }

    return Result.ok(values as OkTypes);
  }

  /**
   * Applies an asynchronous transformation function to the successful value of the result,
   * returning a new successful result. If the current result is a failure, the same failure is returned.
   *
   * @template U - The type of the value in the new result.
   * @param f - An asynchronous function to transform the successful value.
   * @returns A promise resolving to a `Result<U, E>`, either the transformed success or the same failure.
   */
  public async mapAsync<U>(f: (value: T) => Promise<U>): Promise<Result<U, E>> {
    if (this.isFailure) {
      return Result.fail(this.getError());
    }

    const value = await f(this.getValue());

    return Result.ok(value);
  }

  /**
   * Applies an asynchronous transformation function that returns a `Result` to the successful value
   * of the result. If the current result is a failure, the same failure is returned.
   *
   * This is useful for chaining asynchronous operations that can also fail.
   *
   * @template U - The type of the value in the new result.
   * @param f - An asynchronous function that takes the successful value and returns a `Result<U, E>`.
   * @returns A promise resolving to a new `Result<U, E>`, or the current failure.
   */
  public async flatMapAsync<U>(
    f: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return this.isSuccess
      ? await f(this.getValue())
      : Result.fail(this.getError());
  }

  /**
   * Applies a synchronous transformation function that returns a `Result` to the successful value
   * of the result. If the current result is a failure, the same failure is returned.
   *
   * This is useful for chaining operations that may return a result indicating failure.
   *
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a `Result<U, E>`.
   * @returns A new `Result<U, E>`, or the current failure.
   */
  public flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    return this.isSuccess ? f(this.getValue()) : Result.fail(this.getError());
  }

  /**
   * Applies a synchronous transformation function to the successful value of the result,
   * returning a new successful result. If the current result is a failure, the same failure is returned.
   *
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a new value.
   * @returns A new `Result<U, E>` containing the transformed value, or the current failure.
   */
  public map<U>(f: (value: T) => U): Result<U, E> {
    return this.isSuccess
      ? Result.ok(f(this.getValue()))
      : Result.fail(this.getError());
  }

  /**
   * Create a failed result.
   *
   * @param error - Error payload.
   * @returns Failure result.
   */
  public static fail<U = never, F = string>(error: F): Result<U, F> {
    return new Result<U, F>(false, error);
  }

  /**
   * Create a successful result.
   *
   * @param value - Success payload (optional).
   * @returns Success result.
   */
  public static ok<U = void>(value?: U): Result<U, never> {
    return new Result<U, never>(true, undefined, value);
  }

  /**
   * Retrieve the error value.
   * Throws if called on a success result.
   *
   * @returns Error payload.
   * @throws Error if result is successful.
   */
  public getError(): E {
    if (this._isSuccess) {
      throw new InvariantViolationError(
        'InvalidResult: Cannot get the error of a successful result',
      );
    }

    return this._error as E;
  }

  /**
   * Retrieve the success value.
   * Throws if called on a failure result.
   *
   * @returns Success payload.
   * @throws Error if result is a failure.
   */
  public getValue(): T {
    if (!this._isSuccess) {
      throw new InvariantViolationError(
        'InvalidResult: Cannot get the value of a failed result',
      );
    }

    return this._value as T;
  }

  /**
   * Folds (reduces) the Result into a single value by providing handlers for both Value and Error.
   *
   * @param onFailure - The function to handle the Error case.
   * @param onSuccess - The function to handle the Value case.
   * @returns The result of applying the appropriate handler.
   */
  public fold<U>(onFailure: (error: E) => U, onSuccess: (value: T) => U): U {
    return this.isFailure
      ? onFailure(this.getError())
      : onSuccess(this.getValue());
  }

  /**
   * Whether the result represents failure.
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Whether the result represents success.
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }
}

class InvariantViolationError extends Error {}
