/* eslint-disable prettier/prettier */
/* eslint-disable unicorn/no-array-callback-reference */
import type { Guard } from '../domain/invariants/make-guards';
import type { Failure } from '../domain/issues/failure';

import { DataTypeInvariantViolationException } from './type-error';
import { type Identity, identity } from './identity';
import { Option } from './option';
import { Task } from './task';

type ResultState<T, E> =
  | { readonly tag: 'failure'; readonly error: E; }
  | { readonly tag: 'success'; readonly value: T; };

export type ResultFailure<R> = R extends Result<unknown, infer F> ? F : never;

export type ResultSuccess<R> = R extends Result<infer S, unknown> ? S : never;

/**
 * ---
 * A functional object representing the result of an operation,
 * which can either succeed (`ok`) or fail (`fail`), but never both.
 * ---
 * This class enforces correct usage via private constructor and static factory methods.
 * Commonly used in Domain-Driven Design, Functional Programming, and Error Handling patterns.
 * ---
 * @template T - Type of the value when operation succeeds.
 * @template E - Type of the error when operation fails (defaults to `Failure`).
 */
export class Result<T, E = Failure> {
  private readonly state: ResultState<T, E>;

  /**
   * ---
   * Internal constructor. Use `Result.ok()` or `Result.fail()` to create instances.
   * ---
   * Ensures invariants:
   * - Success cannot contain an error.
   * - Failure must contain an error.
   * ---
   * @param state State of current result.
   */
  private constructor(state: ResultState<T, E>) {
    this.state = state;

    Object.freeze(this);
  }

  /**
   * ---
   * Retrieve the error value.
   * ---
   * - throws if called on a success result.
   * ---
   * @returns Error payload.
   * @throws {DataTypeInvariantViolationException} if result is successful.
   */
  public get error(): E {
    if (this.state.tag === 'failure') {
      return this.state.error;
    }

    throw new DataTypeInvariantViolationException(
      `Cannot get the error of a successful result with a value: ${String(this.value)}`,
    );
  }

  /**
   * ---
   * Retrieve the success value.
   * ---
   * - throws if called on a failure result.
   * ---
   * @returns Success payload.
   * @throws {DataTypeInvariantViolationException} if result is a failure.
   */
  public get value(): T {
    if (this.state.tag === 'success') {
      return this.state.value;
    }

    throw new DataTypeInvariantViolationException(
      `Cannot get the value of a failed result with an error: ${String(this.error)}`,
    );
  }

  /**
   * ---
   * Whether the result represents failure.
   * ---
   * @returns failure flag of the result.
   */
  public isFailure(): this is Result<never, E> {
    return this.state.tag === 'failure';
  }

  /**
   * ---
   * Whether the result represents success.
   * ---
   * @returns success flag of the result.
   */
  public isSuccess(): this is Result<T, never> {
    return this.state.tag === 'success';
  }

  /**
   * ---
   * Retrieves current value if `Result` is successful, fallback otherwise.
   * ---
   * @param fallback The fallback value.
   * @returns the contained value or the provided fallback.
   */
  public getOrElse(fallback: T): T {
    return this.isSuccess() ? this.value : fallback;
  }

  /**
   * ---
   * Retrieves current value if `Result` is successful, invokes fallback otherwise.
   * ---
   * @param getFallback The fallback function to invoke.
   * @returns the contained value or the provided fallback.
   */
  public getOrElseLazy(getFallback: () => T): T {
    return this.isSuccess() ? this.value : getFallback();
  }

  /**
   * ---
   * Serializes current `Result` for logging purpose.
   * ---
   *@returns A formatted string.
   */
  public toString(): string {
    return this.isSuccess()
      ? `Success(${JSON.stringify(this.value)})`
      : `Failure(${JSON.stringify(this.error)})`;
  }

  /**
   * ---
   * Adds better Node.js debugging support.
   * ---
   * @returns serialized `Result` values.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }

  /**
   * ---
   * Exhaustively matches on the Result state.
   *
   * This is the **canonical eliminator** for `Result`.
   * It forces the caller to handle both success and failure cases.
   * ---
   * @param cases - all possible states of containter
   * @param cases.fail - callback for failure state
   * @param cases.ok - callback for success state
   */
  public match<U>(cases: { fail: (error: E) => U; ok: (value: T) => U; }): U {
    return this.state.tag === 'success'
      ? cases.ok(this.state.value)
      : cases.fail(this.state.error);
  }

  /**
   * ---
   * Executes a side-effect on success without changing the value.
   * ---
   * @param f Side-effect to perform
   * ---
   * ```ts
   * Result.ok(1).map(x => x * 2).tap(x => someSideEffect(x)).map(x => x)
   * // x === 2
   * ```
   */
  tap(f: (value: T) => void): this {
    if (this.isSuccess()) {
      f(this.value);
    }

    return this;
  }

  /* ------------------------------------------------------------------ */
  /* Invariants                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Ensures that a validator holds for the success value.
   *
   * If the validator fails, the result fails with the produced error.
   * ---
   * Semantics:
   * - preserves the original value
   * - does NOT transform or narrow the value
   * - only widens the failure channel
   * - no boolean predicates allowed
   * ---
   * Intended use:
   * - domain invariant checks
   * - application invariant checks
   * - structural validation
   * ---
   * @param guard Guard to use for ensurance. {@link Guard}
   * ---
   * ```ts
   * Result.ok(value)
   *   .validate(GuardMinimumLength(v, 'name', 3))
   * ```
   */
  validate<F extends Failure, B extends T>(
    guard: Guard<T, B, F>,
  ): Result<T, E | F> {
    return this.flatMap(value =>
      guard.validate(value).match({
        fail: error => Result.fail(error),
        ok: () => Result.ok(value),
      }),
    );
  }

  /**
   * ---
   * Refines the success value using a refinement guard.
   *
   * If the guard fails, the result fails with the produced error.
   * ---
   * Semantics:
   * - transforms the value
   * - may narrow the type
   * - constructs a new value
   * - widens the failure channel
   * ---
   * Intended use:
   * - value object construction
   * - type refinement
   * - invariant-preserving transformations
   * ---
   * @param guard Guard to use for ensurance. {@link Guard}
   * ---
   * ```ts
   * Result.ok(raw)
   *   .refine(GuardNonEmptyString(v, 'title'))
   * ```
   */
  refine<F extends Failure, B extends T>(
    guard: Guard<T, B, F>,
  ): Result<B, E | F> {
    return this.flatMap(value =>
      guard.refine(value).match({
        ok: refined => Result.ok(refined),
        fail: error => Result.fail(error),
      }),
    );
  }

  /* ------------------------------------------------------------------ */
  /* Applicative                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Applies a wrapped function to a wrapped value.
   * ---
   * Enables Applicative-style composition.
   * ---
   * Laws:
   * - identity
   * - homomorphism
   * - interchange
   * - composition
   * ---
   * @param fa - container to apply.
   */
  public ap<U, E2>(
    this: Result<(value: T) => U, E>,
    fa: Result<T, E2>,
  ): Result<U, E2 | E> {
    if (this.isFailure()) {
      return Result.fail(this.error);
    }

    if (fa.isFailure()) {
      return Result.fail(fa.error);
    }

    return Result.ok(this.value(fa.value));
  }

  /* ------------------------------------------------------------------ */
  /* Transforms                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Lifts this result into a {@link Task}.
   * Explicit async boundary.
   */
  toTask(): Task<T, E> {
    return Task.fromResult(this);
  }

  /**
   * ---
   * Converts this `Result` into an `Option`,
   * discarding any error information.
   * ---
   * - `ok(value)`   → `Some(value)`
   * - `fail(error)` → `None`
   * ---
   * ⚠️ This is a **lossy conversion**.
   * Use only when the error is no longer meaningful.
   * ---
   * @returns Corresponding `Option`
   */
  public toOption(): Option<T> {
    return this.state.tag === 'success'
      ? Option.some<T>(this.state.value)
      : Option.none();
  }

  /* ------------------------------------------------------------------ */
  /* Constructors                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Create a failed result.
   * ---
   * @param error - Error payload.
   * @returns Failure result.
   */
  static fail<E, A = never>(error: E): Result<A, E> {
    return new Result({ tag: 'failure', error });
  }

  /**
   * ---
   * Create a successful result.
   * ---
   * @param value - Success payload (optional).
   * @returns Success result.
   */
  static ok<T = void, E = never>(value?: T): Result<T, E> {
    return new Result({ value: value as T, tag: 'success' });
  }

  /**
   * ---
   * Creates a Result from a boolean condition.
   * ---
   * @param condition Boolean value that determines success or failure.
   * @param fail Failure to return in case of failure.
   * @param ok Value to return in case of success.
   */
  static fromBoolean<E>(condition: boolean, fail: E): Result<void, E>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static fromBoolean<T, E>(condition: boolean, fail: E, ok: T): Result<T, E>;
  // eslint-disable-next-line jsdoc/require-jsdoc
  static fromBoolean<E, T = void>(
    condition: boolean,
    fail: E,
    ok?: T,
  ): Result<T, E> {
    // eslint-disable-next-line sonarjs/no-selector-parameter
    return condition ? Result.ok(ok) : Result.fail(fail);
  }

  /**
   * ---
   * Creates a Result from a nullable value.
   * ---
   * @param value Value under checks.
   * @param fail Failure to return in case of failure.
   */
  static fromNullable<T, F>(
    value: undefined | null | T,
    fail: F,
  ): Result<T, F> {
    return value == undefined ? Result.fail(fail) : Result.ok(value);
  }

  /**
   * ---
   * Wraps a function call, capturing any thrown exception as `Result.fail()`.
   * ---
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

  /* ------------------------------------------------------------------ */
  /* Combinators                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Provides an alternative `Result` if this one fails.
   * ---
   * This combinator is:
   * - lazy (alternative evaluated only on failure)
   * - error-agnostic (original error is discarded)
   * - left-biased (success short-circuits)
   * ---
   * Semantics:
   * - if this result is `ok`, it is returned unchanged
   * - if this result is `fail`, the alternative result is evaluated
   * ---
   * Intended use:
   * - branching validation
   * - union construction (A | B)
   * - parser-style alternatives
   * ---
   * @param other - Lazy alternative result
   */
  or<B, E2 extends Failure>(other: () => Result<B, E2>): Result<T | B, E2 | E> {
    return this.isFailure() ? other() : this;
  }

  /**
   * ---
   * Provides an alternative `Result` computed from the failure value.
   * ---
   * This combinator is:
   * - lazy (the alternative is computed only on failure)
   * - error-aware (receives the original error)
   * - left-biased (success short-circuits)
   * ---
   * Semantics:
   * - if this result is `ok`, it is returned unchanged
   * - if this result is `fail`, the provided function is invoked
   *   with the failure value to produce an alternative result
   * ---
   * Intended use:
   * - error translation
   * - error-dependent recovery
   * - conditional fallback based on failure cause
   * ---
   * @param f - Function producing an alternative result from the failure
   */
  orElse<B, E2 extends Failure>(
    f: (error: E) => Result<B, E2>,
  ): Result<T | B, E2 | E> {
    return this.isFailure() ? f(this.error) : this;
  }

  /**
   * ---
   * Combine multiple results into a single result.
   * Useful for validating multiple independent operations.
   * ---
   * - If any result failed, returns the first failure.
   * - Otherwise, returns success.
   * ---
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
      if (result.isFailure()) {
        return Result.fail(result.error);
      }
    }

    return Result.ok();
  }

  /**
   * ---
   * Applies a synchronous transformation function that returns a `Result` to the successful value
   * of the result. This is useful for chaining operations that may return a result indicating failure.
   * ---
   * - if the current result is a failure, the same failure is returned,
   * - if function returns another error type, widened error returned.
   * ---
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a `Result<U, E>`.
   * @returns A new `Result<U, E | E2>`, or the current failure.
   */
  public flatMap<U, EW>(f: (value: T) => Result<U, EW>): Result<U, EW | E> {
    return this.isSuccess() ? f(this.value) : Result.fail(this.error);
  }

  /**
   * ---
   * Applies a synchronous transformation function to the successful value of the result,
   * returning a new successful result.
   * ---
   * - if the current result is a failure, the same failure is returned.
   * ---
   * @template U - The type of the value in the new result.
   * @param f - A function that transforms the successful value into a new value.
   * @returns A new `Result<U, E>` containing the transformed value, or the current failure.
   */
  public map<U>(f: (value: T) => U): Result<U, E> {
    return this.isSuccess()
      ? Result.ok(f(this.value))
      : Result.fail(this.error);
  }

  /**
   * ---
   * Applies a synchronous transformation function to the error of the
   * result, returning a new failed result.
   * ---
   * - if the current result is successful, the same successful result is returned.
   * ---
   * @template E2 - The type of the value in the new result.
   * @param f - A function that transforms the error into a new value.
   * @returns A new `Result<T, U>` containing the transformed error, or the current success.
   */
  public mapError<E2>(f: (error: E) => E2): Result<T, E2> {
    // It is safe type cast to please TS. We know that error type is phantom.
    return this.isFailure()
      ? Result.fail(f(this.error))
      : (this as unknown as Result<T, E2>);
  }

  /**
   * ---
   * Partially maps failure variants to new failure values,
   * with optional `_` default branch.
   * ---
   * Rules:
   * - If `_` is NOT provided → mapping must be exhaustive.
   * - If `_` IS provided → partial mapping allowed.
   * - `_` may collapse all failures.
   * - `_` may return original failure based on `identity` sentinel.
   * ---
   * ```ts
   * const mapOneCollapseRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<F extends Failure, Cases extends FailureCases<F>>(
    this: Result<T, F>,
    cases: Cases,
  ): Result<T, ReturnType<Cases[keyof Cases]>>;

  /**
   * ---
   * Partially maps failure variants to new failure values,
   * with optional `_` default branch.
   * ---
   * Rules:
   * - If `_` is NOT provided → mapping must be exhaustive.
   * - If `_` IS provided → partial mapping allowed.
   * - `_` may collapse all failures.
   * - `_` may return original failure based on `identity` sentinel.
   * ---
   * ```ts
   * const mapOneCollapseRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<
    F extends Failure,
    Cases extends FailureCasesWithDefault<F>,
  >(
    this: Result<T, F>,
    cases: Cases,
  ): Result<T, DefaultReturn<F, Cases> | ExplicitReturn<Cases>>;

  /**
   * ---
   * Partially maps failure variants to new failure values,
   * with optional `_` default branch.
   * ---
   * Rules:
   * - If `_` is NOT provided → mapping must be exhaustive.
   * - If `_` IS provided → partial mapping allowed.
   * - `_` may collapse all failures.
   * - `_` may return original failure based on `identity` sentinel.
   * ---
   * @param cases - Failure handlers
   * ---
   * ```ts
   * const mapOneCollapseRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = result.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<
    F extends Failure,
    Cases extends FailureCasesWithDefault<F> | FailureCases<F>,
  >(this: Result<T, F>, cases: Cases): Result<T> {
    return this.match({
      fail: failure => {
        const explicit = (cases as Partial<FailureCases<F>>)[
          failure._tag as F['_tag']
        ];

        if (explicit) {
          return Result.fail(explicit(failure as ExtractByTag<F, F['_tag']>));
        }

        if ('_' in cases) {
          if (cases._ === identity) {
            return Result.fail(failure);
          }

          return Result.fail(cases._(failure));
        }

        return Result.fail(failure);
      },
      ok: value => Result.ok(value),
    });
  }

  /**
   * ---
   * Applies transformations to both the `success` and `failure` cases of this `Result`.
   * ---
   * - if the result is successful (`ok`), applies the `onSuccess` function
   * to the contained `value` and wraps it back into a new `ok`.
   * - if the result is a failure (`error`), applies the `onFailure` function
   * to the contained `error` and wraps it back into a new `error`.
   * ---
   * Unlike `Result.fold`, this method preserves the `Result` container type,
   * allowing further monadic chaining and composition.
   * ---
   * @template T - The success type of the current result.
   * @template E - The error type of the current result.
   * @template U - The success type of the new result after applying `onSuccess`.
   * @template E2 - The error type of the new result after applying `onFailure`.
   * @param onSuccess - Function to transform the success value when this is `ok`.
   * @param onFailure - Function to transform the error value when this is `error`.
   * @returns A new `Result` containing either:
   * - the transformed success value of type `U` if the original result was successful, or
   * - the transformed error value of type `E2` if the original result was a failure.
   * ---
   * ```ts
   * const success = Result.ok(42);
   * const result = success.bimap(
   *   v => v * 2,
   *   e => `Error: ${e}`
   * );
   * // result is Ok(84)
   *
   * const failure = Result.fail("boom");
   * const result = failure.bimap(
   *   v => v * 2,
   *   e => `Error: ${e}`
   * );
   * // result is Err("Error: boom")
   * ```
   */
  public bimap<U, E2>(
    onSuccess: (value: T) => U,
    onFailure: (error: E) => E2,
  ): Result<U, E2> {
    // It is safe type cast to please TS. We know that error type is phantom.
    return this.isSuccess()
      ? (Result.ok(onSuccess(this.value)) as unknown as Result<U, E2>)
      : Result.fail<E2>(onFailure(this.error));
  }
}

type ExtractByTag<F, U = F extends { _tag: infer U; } ? U : never> = F extends {
  _tag: U;
}
  ? F
  : never;

type FailureCases<F extends Failure> = {
  [Tag in F['_tag']]: (f: ExtractByTag<F, Tag>) => Failure;
};

type FailureCasesWithDefault<F extends Failure> =
  | ({
    _: (failure: F) => Failure;
  } & Partial<FailureCases<F>>)
  | Partial<FailureCases<F>> & ({
    _: Identity;
  });

type HandledTags<C> = Exclude<keyof C, '_'>;

type ExcludeHandled<F extends Failure, C> = F extends { _tag: infer Tag; }
  ? Tag extends HandledTags<C>
  ? never
  : F
  : never;

type ExplicitReturn<C> = {
  [K in Exclude<keyof C, '_'>]: C[K] extends (...as: unknown[]) => infer R
  ? R
  : never;
}[Exclude<keyof C, '_'>];

type DefaultReturn<F extends Failure, C> = C extends { _: Identity; }
  ? ExcludeHandled<F, C>
  : C extends { _: (f: unknown) => infer R; }
  ? R
  : never;
