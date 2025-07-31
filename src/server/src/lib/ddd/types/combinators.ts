import { Either } from './either';
import { Result } from './result';

/**
 * Combines multiple `Result` instances and accumulates their errors.
 * Returns a successful `Result` if all are successful.
 * @template T Type of the containing values (can be mixed).
 * @param results Array of `Result` instances
 * @returns A `Result` containing all values and all errors.
 */
export function combineResults<
  T extends readonly Result<unknown, unknown>[],
  OkTypes = {
    [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
  },
  ErrorTypes = {
    [K in keyof T]: T[K] extends Result<unknown, infer V> ? V : never;
  },
>(results: [...T]): Result<OkTypes, ErrorTypes> {
  const errors: unknown[] = [];
  const values: unknown[] = [];

  for (const result of results) {
    result.fold(
      error => errors.push(error),
      value => values.push(value),
    );
  }

  return errors.length > 0
    ? Result.fail(errors as ErrorTypes)
    : Result.ok(values as OkTypes);
}

/**
 * Combines multiple `Either` instances and accumulates their hands.
 * Returns a Right hand of `Either` if all are Rights.
 * @template T Type of the containing values (can be mixed).
 * @param eithers Array of `Either` instances
 * @returns A `Either` containing all Lefts and all Rights.
 */
export function combineEithers<
  T extends readonly Either<unknown, unknown>[],
  LeftTypes = {
    [K in keyof T]: T[K] extends Either<unknown, infer V> ? V : never;
  },
  RightTypes = {
    [K in keyof T]: T[K] extends Either<infer U, unknown> ? U : never;
  },
>(eithers: [...T]): Either<LeftTypes, RightTypes> {
  const lefts: unknown[] = [];
  const rights: unknown[] = [];

  for (const either of eithers) {
    either.fold(
      left => lefts.push(left),
      right => rights.push(right),
    );
  }

  return lefts.length > 0
    ? Either.left(lefts as LeftTypes)
    : Either.right(rights as RightTypes);
}
