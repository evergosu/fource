/**
 * Represents a disjoint union of two possible values: a value of type `R` (Right) or a value of type `L` (Left).
 *
 * `Either` is commonly used to model computations that may fail.
 * - `Right` represents a success case containing a result.
 * - `Left` represents a failure case containing an error.
 *
 * This allows error-handling to be expressed explicitly and functionally.
 *
 * @template L - The type of the error (Left).
 * @template R - The type of the success value (Right).
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
   * Creates a Right instance representing a successful computation.
   *
   * @param value - The success value.
   * @returns An Either in the Right state.
   */
  static right<R, L = never>(value: R): Either<L, R> {
    return new Either<L, R>(undefined, value, true);
  }

  /**
   * Creates a Left instance representing a failed computation.
   *
   * @param value - The error value.
   * @returns An Either in the Left state.
   */
  static left<L, R = never>(value: L): Either<L, R> {
    return new Either<L, R>(value, undefined, false);
  }

  /** Wraps a function call, capturing any thrown exception as Left. */
  static tryCatch<L, R>(
    function_: () => R,
    onError: (error: unknown) => L,
  ): Either<L, R> {
    try {
      return Either.right(function_());
    } catch (error) {
      return Either.left(onError(error));
    }
  }

  /**
   * Type guard to check whether the Either is a Right.
   *
   * @param either - The Either instance to check.
   * @returns `true` if the instance is Right.
   */
  public isRight(): this is Either<never, R> {
    return this.isRightFlag;
  }

  /**
   * Type guard to check whether the Either is a Left.
   *
   * @param either - The Either instance to check.
   * @returns `true` if the instance is Left.
   */
  public isLeft(): this is Either<L, never> {
    return !this.isRightFlag;
  }

  /** Get value from Right. Throws if Left. */
  public getRight(): R {
    if (this.isLeft()) {
      throw new Error('Cannot get value from Left');
    }
    return this.rightValue as R;
  }

  /** Get value from Left. Throws if Right. */
  public getLeft(): L {
    if (this.isRight()) {
      throw new Error('Cannot get left value from Right');
    }
    return this.leftValue as L;
  }

  /**
   * Applies a function to transform the Right value if present.
   *
   * If the Either is Left, the original Left is returned unchanged.
   *
   * @param function_ - The function to apply to the Right value.
   * @returns A new Either with the transformed Right value or the original Left.
   */
  public map<U>(function_: (r: R) => U): Either<L, U> {
    return this.isRight()
      ? Either.right(function_(this.rightValue as R))
      : Either.left(this.leftValue as L);
  }

  /**
   * Applies a function to transform the Left value if present.
   *
   * If the Either is Right, the original Right is returned unchanged.
   *
   * @param function_ - The function to apply to the Left value.
   * @returns A new Either with the transformed Left value or the original Right.
   */
  public mapLeft<U>(function_: (l: L) => U): Either<U, R> {
    return this.isLeft()
      ? Either.left(function_(this.leftValue as L))
      : Either.right(this.rightValue as R);
  }

  /**
   * Applies a function that returns another Either to the Right value if present (monadic bind).
   *
   * Enables chaining multiple computations that may fail.
   * If the Either is Left, the original Left is returned unchanged.
   *
   * @param function_ - The function to apply to the Right value, returning a new Either.
   * @returns The result of applying the function or the original Left.
   */
  public flatMap<U, NL>(function_: (r: R) => Either<NL, U>): Either<NL | L, U> {
    return this.isRight()
      ? function_(this.getRight())
      : Either.left(this.getLeft());
  }

  /**
   * Folds (reduces) the Either into a single value by providing handlers for both Left and Right.
   *
   * @param onLeft - The function to handle the Left case.
   * @param onRight - The function to handle the Right case.
   * @returns The result of applying the appropriate handler.
   */
  public fold<T>(onLeft: (l: L) => T, onRight: (r: R) => T): T {
    return this.isLeft()
      ? onLeft(this.leftValue as L)
      : onRight(this.rightValue as R);
  }

  /** Convert to string for debugging */
  public toString(): string {
    return this.isRight()
      ? `Right(${JSON.stringify(this.rightValue)})`
      : `Left(${JSON.stringify(this.leftValue)})`;
  }
}
