import { Result } from './result';

/**
 * Combines multiple `Result` instances and accumulates their errors.
 * Returns a successful `Result` if all are successful.
 * @template T Type of the successful values (can be mixed).
 * @template E Type of the error (extends BaseError).
 * @param results Array of `Result` instances
 * @returns A `Result` containing all values or all errors.
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
