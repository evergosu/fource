/* eslint-disable prettier/prettier */
import type { Guard } from '../domain/invariants/make-guards';
import type { Failure } from '../domain/issues/failure';

/**
 * `Task` represents a **lazy, composable, asynchronous effect**
 * that may fail with a typed error.
 *
 * Reasons to have:
 * - Make async behavior explicit and testable.
 * - Avoid `try/catch` and `async/await` scattering.
 * - Preserve domain-level error types.
 * - Enforce DDD layer boundaries by types.
 * ---
 * Invariants:
 * - execution is lazy
 * - failures short-circuit
 * - errors are values, not control flow
 * - composition preserves type information
 * ---
 * Task is an abstraction over:
 * ```ts
 * Task<A, E> ≈ () => Promise<Result<A, E>>
 * ```
 */
import { type Identity, identity } from './identity';
import { Result } from './result';

/**
 * ---
 * Represents a **lazy asynchronous computation** that eventually
 * yields a {@link Result}.
 * ---
 * A `Task`:
 * - Is lazy (no execution until {@link Task.run}).
 * - Is referentially transparent.
 * - Composable (via {@link Task.map} / {@link Task.flatMap}) without nesting Promises.
 * - Accumulates error types via union widening.
 * - Explicit about side effects.
 * ---
 * @param A Success value
 * @param E Failure value
 * ---
 * ```ts
 * const task = Task
 *   .fromPromise(() => database.query())
 *   .map(rows => rows.at(0))
 *   .ensure(
 *     row => row !== undefined,
 *     new NotFoundFailure(),
 *   );
 *
 * const result = await task.run();
 * ```
 */
export class Task<A, E> {
  /**
   * ---
   * Constructs a new Task.
   * ---
   * @param effect - Lazy async computation returning a {@link Result}
   */

  private constructor(private readonly effect: () => Promise<Result<A, E>>) { }

  /**
   * ---
   * Executes the task and produces its {@link Result}.
   * ---
   * ⚠️ This is the **only** place where side effects occur.
   *
   * - calling `run()` executes the effect exactly once
   * - no execution happens before `run()`
   * - may perform I/O
   * - should happen at application boundaries
   * ---
   *```ts
   * const result = await task.run();
   *
   * if (result.isFailure) {
   *   handle(result.error);
   * }
   * ```
   */
  run(): Promise<Result<A, E>> {
    return this.effect();
  }

  /**
   * ---
   * Executes a side-effect on success without changing the value.
   * ---
   * @param f Side-effect to perform
   * ---
   * ```ts
   * Task.ok(1).map(x => x * 2).tap(x => someSideEffect(x)).map(x => x)
   * // x === 2
   * ```
   */
  tap(f: (value: A) => void): Task<A, E> {
    return this.flatMap<A, E>(value => {
      f(value);

      return Task.ok<A, E>(value);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Invariants                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Ensures that a predicate holds for the success value.
   *
   * If the predicate returns `false`, the task fails with
   * the provided error.
   * ---
   * Returning `boolean` from Tasks leaks infrastructure concerns.
   * `ensure` converts such checks into typed failures.
   *
   * - optimistic locking checks
   * - authorization guards
   * - existence validation
   * ---
   * @param predicate Check to perform ensurance
   * @param error Error to produce if predicate returns false
   * ---
   * ```ts
   * task.ensure(rows => rows.length > 0, new ConcurrencyFailure());
   * ```
   */
  ensure<P extends A, F>(predicate: (value: A) => value is P, error: F): Task<P, E | F> {
    return this.flatMap(value => (predicate(value) ? Task.ok(value) : Task.fail(error)));
  }

  /**
   * ---
   * Ensures that a validator holds for the success value.
   *
   * If the validator returns fail, the task fails with
   * the provided error.
   * ---
   * - preserves value
   * - only adds failure channel
   * - no type change
   * - no transformation
   * ---
   * @param guard Guard to use for ensurance. {@link Guard}
   * ---
   * ```ts
   * task.validate(GuardString(x, 'x'));
   * ```
   */
  validate<F extends Failure, B extends A>(guard: Guard<A, B, F>): Task<A, E | F> {
    return this.flatMap(value =>
      guard.validate(value).match({
        fail: error => Task.fail(error),
        ok: () => Task.ok(value),
      }),
    );
  }

  /**
   * ---
   * Ensures that a refiner holds for the success value.
   *
   * If the refiner returns fail, the task fails with
   * the provided error.
   * ---
   * - transforms value
   * - narrows type
   * - constructs new value
   * ---
   * @param guard Guard to use for ensurance. {@link Guard}
   * ---
   * ```ts
   * task.refine(GuardSring(x, 'x'));
   * ```
   */
  refine<F extends Failure, B extends A>(guard: Guard<A, B, F>): Task<B, E | F> {
    return this.flatMap(value =>
      guard.refine(value).match({
        ok: refined => Task.ok(refined),
        fail: error => Task.fail(error),
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
   * Runs this task and the argument task in parallel.
   * Fails fast.
   * ---
   * Laws:
   * - identity
   * - homomorphism
   * - interchange
   * - composition
   * ---
   * @param fa - container to apply.
   */
  public ap<B, F>(this: Task<(value: A) => B, E>, fa: Task<A, F>): Task<B, E | F> {
    return new Task(async () => {
      const [rf, ra] = await Promise.all([this.run(), fa.run()]);

      if (rf.isFailure()) {
        return Result.fail(rf.error);
      }

      if (ra.isFailure()) {
        return Result.fail(ra.error);
      }

      return Result.ok(rf.value(ra.value));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Transforms                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Lifts an already computed {@link Result} into a {@link Task}.
   * ---
   * @param result - Existing `Result`
   */
  static fromResult<A, E>(result: Result<A, E>): Task<A, E> {
    return new Task(() => Promise.resolve(result));
  }

  /**
   * ---
   * Lifts a Promise-producing effect into a {@link Task}.
   * ---
   * - captures **thrown exceptions**
   * - failure type is **never by design**
   * - no error interpretation happens here
   * - this method is intended **only for infrastructure code**
   * ---
   * Why `never`? To support widen types.
   *
   * JavaScript promises can throw *anything*.
   * Error translation must be explicit:
   * ---
   * @param effect Lazy async function
   * ---
   * ```ts
   * Task.fromPromise(fetchUser).mapError(e => new InfraFailure(e))
   * ```
   */
  static fromPromise<A, E = never>(effect: () => Promise<A>): Task<A, E> {
    return new Task(async () => {
      try {
        return Result.ok(await effect());
      } catch (error) {
        return Result.fail(error as E);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Constructors                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Creates a successful task.
   * ---
   * @param value - Success value
   * @returns A task that always succeeds
   */
  static ok<A = void, E = never>(value?: A): Task<A, E> {
    return new Task(() => Promise.resolve(Result.ok(value as A)));
  }

  /**
   * ---
   * Creates a failed task.
   * ---
   * @param error - Failure value
   * @returns A task that always fails
   */
  static fail<E, A = never>(error: E): Task<A, E> {
    // eslint-disable-next-line promise/no-promise-in-callback
    return new Task(() => Promise.resolve(Result.fail(error)));
  }

  /* ------------------------------------------------------------------ */
  /* Combinators                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Transforms the successful value of this task.
   * ---
   * @param f - Mapping function
   * @returns A new task with transformed success value
   * ---
   * ```ts
   * Task.ok(2).map(x => x * 2);
   * ```
   */
  map<B>(f: (value: A) => B): Task<B, E> {
    return new Task(async () => {
      const result = await this.run();
      // eslint-disable-next-line unicorn/no-array-callback-reference
      return result.map(f);
    });
  }

  /**
   * ---
   * Transforms the failure value of this task.
   * ---
   * @param f - Error mapping function
   * ---
   * ```ts
   * task.mapError(err => new InfraError(err));
   * ```
   */
  mapError<F>(f: (error: E) => F): Task<A, F> {
    return new Task(async () => {
      const result = await this.run();

      return result.mapError(f);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Failure transforms                                                 */
  /* ------------------------------------------------------------------ */

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
   * const mapOneCollapseRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<F extends Failure, Cases extends FailureCases<F>>(
    this: Task<A, F>,
    cases: Cases,
  ): Task<A, ReturnType<Cases[keyof Cases]>>;

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
   * const mapOneCollapseRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<F extends Failure, Cases extends FailureCasesWithDefault<F>>(
    this: Task<A, F>,
    cases: Cases,
  ): Task<A, DefaultReturn<F, Cases> | ExplicitReturn<Cases>>;
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
   * const mapOneCollapseRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: f => UnknownFailure(f),
   * });
   * const mapOnePreserveRest = task.matchFailure({
   *   EmptyArrayFailure: f => NotFoundFailure(f),
   *   _: identity,
   * });
   * ```
   */
  public matchFailure<F extends Failure, Cases extends FailureCasesWithDefault<F> | FailureCases<F>>(
    this: Task<A, F>,
    cases: Cases,
  ): Task<A, Failure> {
    return new Task(async () => {
      const result = await this.run();

      return result.match({
        fail: failure => {
          const explicit = (cases as Partial<FailureCases<F>>)[failure._tag as F['_tag']];

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
    });
  }

  /**
   * ---
   * Sequentially composes two tasks.
   * ---
   * - executes this task
   * - if it fails → short-circuits
   * - if it succeeds → executes the next task
   * ---
   * @param f Function producing the next task
   * ---
   * Error types are **widened automatically**:
   *
   * ```ts
   * Task<A, E>.flatMap(() => Task<B, F>)
   * // => Task<B, E | F>
   * ```
   */
  flatMap<B, F>(f: (value: A) => Task<B, F>): Task<B, E | F> {
    return new Task(async (): Promise<Result<B, E | F>> => {
      const result = await this.run();

      if (result.isFailure()) {
        return Result.fail(result.error);
      }

      const next = await f(result.value).run();

      return next.mapError(x => x);
    });
  }

  /**
   * ---
   * Exhaustively matches on the Task result.
   * ---
   * This is the **control flow combinator** for `Task`.
   * It executes the effect and forces handling of both
   * success and failure cases.
   * ---
   * After matching, the error channel is eliminated.
   * ---
   * @param cases - Handlers for both success and failure outcomes
   * @param cases.fail - Handler for failure result
   * @param cases.ok - Handler for success result
   * ---
   * @returns A Task that cannot fail
   */
  public match<U>(cases: {
    fail: (error: E) => Task<U, never> | U;
    ok: (value: A) => Task<U, never> | U;
  }): Task<U, never> {
    return new Task(async () => {
      const result = await this.run();

      const output = result.isSuccess() ? cases.ok(result.value) : cases.fail(result.error);

      if (output instanceof Task) {
        return output.run();
      }

      return Result.ok(output);
    });
  }

  /**
   * ---
   * Transforms the underlying {@link Result} directly.
   * ---
   * - logging
   * - metrics
   * - retries
   * - normalization
   * ---
   * - not for business logic
   * - not for branching
   * - prefer `map`, `mapError`, or `flatMap` instead.
   * ---
   * @param f - mapping function
   */
  mapResult<B, F>(f: (result: Result<A, E>) => Result<B, F>): Task<B, F> {
    return new Task(async () => f(await this.run()));
  }

  /* ------------------------------------------------------------------ */
  /* Static utilities                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * ---
   * Traverses a collection while sequencing asynchronous effects.
   * ---
   * Applies a function producing a {@link Task} to each element
   * of an array and collects the results.
   *
   * - executes tasks sequentially
   * - fails fast on first failure
   * - preserves order
   * ---
   * Typical uses:
   * - processing outbox events
   * - executing command batches
   * - transforming query results
   * ---
   * @param values collection to traverse
   * @param f effectful mapping function
   *
   * ---
   * ```ts
   * Task.traverse([1,2,3], n => Task.ok(n * 2))
   * // Task<[2,4,6], never>
   */
  static traverse<A, B, E>(values: A[], f: (value: A, index: number) => Task<B, E>): Task<B[], E> {
    return new Task(async () => {
      const results: B[] = [];

      for (const [index, value] of values.entries()) {
        const task = f(value, index);

        const result = await task.run();

        if (result.isFailure()) {
          return Result.fail(result.error);
        }

        results.push(result.value);
      }

      return Result.ok(results);
    });
  }

  /**
   * ---
   * Traverses a collection and discards produced values.
   * ---
   * Executes tasks sequentially and fails fast on the first failure.
   * Unlike {@link Task.traverse}, this combinator does not accumulate
   * results and therefore returns `Task<void, E>`.
   *
   * ---
   * @param values collection to traverse
   * @param f effectful mapping function
   */
  static traverseDiscard<A, E>(values: A[], f: (value: A, index: number) => Task<unknown, E>): Task<void, E> {
    return new Task(async () => {
      for (const [index, value] of values.entries()) {
        const result = await f(value, index).run();

        if (result.isFailure()) {
          return Result.fail(result.error);
        }
      }

      return Result.ok();
    });
  }

  /**
   * ---
   * Traverses a collection in parallel.
   * ---
   * All tasks start concurrently.
   * Fails fast if any task fails.
   * ---
   * @param values collection to traverse
   * @param f effectful mapping function
   */
  static traverseParallel<A, B, E>(values: A[], f: (value: A, index: number) => Task<B, E>): Task<B[], E> {
    return new Task(async () => {
      const results = await Promise.all(
        values.map(async (value, index) => {
          const result = await f(value, index).run();

          if (result.isFailure()) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw result.error;
          }

          return result.value;
        }),
      );

      return Result.ok(results);
    }).mapError(x => x as E);
  }

  /**
   * ---
   * Runs multiple tasks sequentially and collects results.
   * Fails fast on first failure.
   * ---
   * @param tasks array of tasks to run in secuence
   */
  static sequence<A, E>(tasks: Task<A, E>[]): Task<A[], E> {
    return new Task(async () => {
      const results: A[] = [];

      for (const task of tasks) {
        const result = await task.run();

        if (result.isFailure()) {
          return Result.fail(result.error);
        }

        results.push(result.value);
      }

      return Result.ok(results);
    });
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
  | (Partial<FailureCases<F>> & {
    _: Identity;
  });

type HandledTags<C> = Exclude<keyof C, '_'>;

type ExcludeHandled<F extends Failure, C> = F extends { _tag: infer Tag; }
  ? Tag extends HandledTags<C>
  ? never
  : F
  : never;

type ExplicitReturn<C> = {
  [K in Exclude<keyof C, '_'>]: C[K] extends (...as: unknown[]) => infer R ? R : never;
}[Exclude<keyof C, '_'>];

type DefaultReturn<F extends Failure, C> = C extends { _: Identity; }
  ? ExcludeHandled<F, C>
  : C extends { _: (f: F) => infer R; }
  ? R
  : never;
