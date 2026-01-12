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
  // eslint-disable-next-line prettier/prettier
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

  /* ------------------------------------------------------------------ */
  /* Constructors                                                       */
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

      if (result.isFailure) {
        return Result.failWiden(result.error);
      }

      const next = await f(result.value).run();

      return next.mapErrorWiden(x => x);
    });
  }

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
  ensure<F>(predicate: (value: A) => boolean, error: F): Task<A, E | F> {
    return this.flatMap(value =>
      predicate(value) ? Task.ok(value) : Task.fail(error),
    );
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
   * Runs multiple tasks sequentially and collects results.
   * Fails fast on first failure.
   * ---
   * @param tasks array of tasks to run in secuence
   */
  static all<A, E>(tasks: Task<A, E>[]): Task<A[], E> {
    return new Task(async () => {
      const results: A[] = [];

      for (const task of tasks) {
        const result = await task.run();

        if (result.isFailure) {
          return Result.fail(result.error);
        }

        results.push(result.value);
      }

      return Result.ok(results);
    });
  }
}
