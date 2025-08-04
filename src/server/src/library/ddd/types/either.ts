import { DataTypeInvariantViolationException } from './type-error';

/**
 * Represents a disjoint union of two possible values: a value of type `R` (Right) or a value of type `L` (Left).
 *
 * `Either` is commonly used to model computations that may fail.
 * - `Right` represents a success case containing a result.
 * - `Left` represents a failure case containing an error.
 *
 * This allows error-handling to be expressed explicitly and functionally.
 * @template L - The type of the error (`Left`).
 * @template R - The type of the success value (`Right`).
 */
export class Either<L, R> {
  private constructor(
    private readonly leftValue: undefined | L,
    private readonly rightValue: undefined | R,
    private readonly isRightFlag = false,
  ) {
    this.leftValue = leftValue;
    this.rightValue = rightValue;
    this.isRightFlag = isRightFlag;
    Object.freeze(this);
  }

  /**
   * Creates a `Right` instance representing a successful computation.
   * @param value - The success value.
   * @returns An `Either` in the `Right` state.
   */
  static right<R = void, L = never>(value?: R): Either<L, R> {
    return new Either<L, R>(undefined, value, true);
  }

  /**
   * Creates a `Left` instance representing a failed computation.
   * @param value - The error value.
   * @returns An `Either` in the `Left` state.
   */
  static left<L = void, R = never>(value?: L): Either<L, R> {
    return new Either<L, R>(value, undefined, false);
  }

  /**
   * Wraps a function call, capturing any thrown exception as `Left`.
   * @param f - The function to try.
   * @param onError - The function to invoke on error state.
   * @returns An `Right` on success, `Left` otherwise.
   */
  static tryCatch<L, R>(
    f: () => R,
    onError: (error: unknown) => L,
  ): Either<L, R> {
    try {
      return Either.right(f());
    } catch (error) {
      return Either.left(onError(error));
    }
  }

  /**
   * Type guard to check whether the `Either` is a `Right`.
   * @returns `true` if the instance is `Right`.
   */
  public isRight(): this is Either<never, R> {
    return this.isRightFlag;
  }

  /**
   * Type guard to check whether the `Either` is a `Left`.
   * @returns `true` if the instance is `Left`.
   */
  public isLeft(): this is Either<L, never> {
    return !this.isRightFlag;
  }

  /**
   * Unboxes the `Right` value of `Either` type.
   * @returns a `Right` value if called on `Right`
   * @throws An `DataTypeInvariantViolationError` if called on `Left`
   */
  public getRight(): R {
    if (this.isLeft()) {
      throw new DataTypeInvariantViolationException(
        'Cannot get a right value from the left side',
      );
    }

    return this.rightValue as R;
  }

  /**
   * Unboxes the `Left` value of `Either` type.
   * @returns a `Left` value if called on `Left`
   * @throws An `DataTypeInvariantViolationError` if called on `Right`
   */
  public getLeft(): L {
    if (this.isRight()) {
      throw new DataTypeInvariantViolationException(
        'Cannot get a left value from the right side',
      );
    }

    return this.leftValue as L;
  }

  /**
   * Combine multiple Eithers into a single Either.
   * - If any Either is Left, returns the first Left.
   * - Otherwise, returns Right(void).
   *
   * Useful for validating multiple independent operations.
   * @param eithers - Array of Eithers to combine.
   * @returns Combined either.
   */
  public static combine<L>(eithers: Either<L, unknown>[]): Either<L, void> {
    for (const either of eithers) {
      if (either.isLeft()) {
        return Either.left(either.getLeft());
      }
    }

    return Either.right();
  }

  /**
   * Retrieves current value if `Either` is `Right`, fallback otherwise.
   * @param fallback The fallback value.
   * @returns the contained value or the provided fallback.
   */
  public getOrElse(fallback: R): R {
    return this.isRight() ? (this.rightValue as R) : fallback;
  }

  /**
   * Retrieves current value if `Either` is `Right`, invokes fallback otherwise.
   * @param getFallback The fallback function to invoke.
   * @returns the contained value or the provided fallback.
   */
  public getOrElseLazy(getFallback: () => R): R {
    return this.isRight() ? (this.rightValue as R) : getFallback();
  }

  /**
   * Applies a function to transform the `Right` value if present.
   * If the `Either` is `Left`, the original `Left` is returned unchanged.
   * @param f - The function to apply to the `Right` value.
   * @returns A new `Either` with the transformed `Right` value or the original `Left`.
   */
  public map<U>(f: (r: R) => U): Either<L, U> {
    return this.isRight()
      ? Either.right(f(this.rightValue as R))
      : Either.left(this.leftValue as L);
  }

  /**
   * Applies an asynchronous function to transform the `Right` value if present.
   * If the `Either` is `Left`, the original `Left` is returned unchanged.
   * @param f - The asynchronous function to apply to the `Right` value.
   * @returns A new `Either` with the transformed `Right` value or the original `Left`.
   */
  public async mapAsync<U>(f: (r: R) => Promise<U>): Promise<Either<L, U>> {
    return this.isRight()
      ? Either.right(await f(this.rightValue as R))
      : Either.left(this.leftValue as L);
  }

  /**
   * Applies a function to transform the `Left` value if present.
   * If the `Either` is `Right`, the original `Right` is returned unchanged.
   * @param f - The function to apply to the `Left` value.
   * @returns A new `Either` with the transformed `Left` value or the original `Right`.
   */
  public mapLeft<U>(f: (l: L) => U): Either<U, R> {
    return this.isLeft()
      ? Either.left(f(this.leftValue as L))
      : Either.right(this.rightValue as R);
  }

  /**
   * Applies a function that returns another `Either` to the `Right` value if present (monadic bind).
   * Enables chaining multiple computations that may fail.
   * If the `Either` is `Left`, the original `Left` is returned unchanged.
   * @param f - The function to apply to the `Right` value, returning a new `Either`.
   * @returns The result of applying the function or the original `Left`.
   */
  public flatMap<U, NL>(f: (r: R) => Either<NL, U>): Either<NL | L, U> {
    return this.isRight() ? f(this.getRight()) : Either.left(this.getLeft());
  }

  /**
   * Applies an asynchronous function that returns another `Either` to the `Right` value if present (monadic bind).
   * Enables chaining multiple asynchronous computations that may fail.
   * If the `Either` is `Left`, the original `Left` is returned unchanged.
   * @param f - The asynchronous function to apply to the `Right` value, returning a new `Either`.
   * @returns The result of applying the function or the original `Left`.
   */
  public async flatMapAsync<U, NL>(
    f: (r: R) => Promise<Either<NL, U>>,
  ): Promise<Either<NL | L, U>> {
    return this.isRight()
      ? await f(this.getRight())
      : Either.left(this.getLeft());
  }

  /**
   * Folds (reduces) the `Either` into a single value by providing handlers for both `Left` and `Right`.
   * @param onLeft - The function to handle the `Left` case.
   * @param onRight - The function to handle the `Right` case.
   * @returns The result of applying the appropriate handler.
   */
  public fold<T>(onLeft: (l: L) => T, onRight: (r: R) => T): T {
    return this.isLeft()
      ? onLeft(this.leftValue as L)
      : onRight(this.rightValue as R);
  }

  /**
   * Serializes current `Either` for logging purpose.
   *@returns A formatted string.
   */
  public toString(): string {
    return this.isRight()
      ? `Right(${JSON.stringify(this.rightValue)})`
      : `Left(${JSON.stringify(this.leftValue)})`;
  }

  /**
   * Adds better Node.js debugging support.
   * @returns serialized `Either` values.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}
