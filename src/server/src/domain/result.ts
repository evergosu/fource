/**
 * A functional object representing the result of an operation,
 * which can either succeed (`ok`) or fail (`fail`), but never both.
 *
 * This class enforces correct usage via private constructor and static factory methods.
 * Commonly used in Domain-Driven Design, Functional Programming, and Error Handling patterns.
 *
 * @template T - Type of the value when operation succeeds.
 * @template E - Type of the error when operation fails (defaults to `string`).
 */
export class Result<T, E = string> {
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
  public static combine<T, E>(results: Result<T, E>[]): Result<void, E> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.getError());
      }
    }

    return Result.ok();
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
  public static ok<U>(value?: U): Result<U, never> {
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
