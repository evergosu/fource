import type { Result } from '../result';

/**
 * ---
 * Minimal runtime required to evaluate laws.
 * ---
 * This abstracts over:
 * - sync containers (Result, Either, Option)
 * - async containers (Task)
 * ---
 * Laws never care *how* values are produced.
 */
export interface LawRuntime<F, A, E = never> {
  /**
   * ---
   * Executes the container and extracts its value.
   * ---
   * Sync containers return Promise.resolve(...)
   * Async containers await effects.
   */
  run(fa: F): Promise<Result<A, E>>;

  /**
   * ---
   * Structural equality for law comparison.
   * ---
   * - this is NOT `===`
   * - it must compare semantic equality.
   */
  equals(left: Result<A, E>, right: Result<A, E>): boolean;
}
