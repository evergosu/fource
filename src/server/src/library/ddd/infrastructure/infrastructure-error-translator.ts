/* eslint-disable prettier/prettier */
/**
 * ---
 * @file
 * Infrastructure-level error translation utilities.
 * ---
 * This module defines contracts and helpers for translating
 * **known, intentional infrastructure errors** (e.g. database constraint
 * violations) into **explicit domain failures**, while allowing all other
 * unexpected errors to propagate normally.
 * ---
 * - It is allowed to depend on database/driver-specific details
 *   (e.g. SQLSTATE codes, constraint names).
 * - Only errors that have clear business meaning should be translated.
 */

import type { Failure } from '../errors';

/**
 * ---
 * Result of attempting to translate an infrastructure error.
 * ---
 * This discriminated union makes translation explicit and forces callers
 * to decide what to do with unrecognized infrastructure errors.
 * ---
 * @template Failure - Domain failure type produced by the translator
 */
export type InfrastructureTranslation<Failure> =
  | {
    /**
     * ---
     * Indicates that the error was successfully translated
     * into a domain-level failure.
     */
    translated: true;

    /**
     * ---
     * Domain failure representing the translated infrastructure error.
     */
    failure: Failure;
  }
  | {
    /**
     * ---
     * Indicates that the error is unknown or not meaningful
     * at the domain level and should be rethrown.
     */
    translated: false;
  };

/**
 * ---
 * Contract for infrastructure error translators.
 * ---
 * An `InfrastructureErrorTranslator` inspects **raw infrastructure errors**
 * (database driver errors, constraint violations, etc.) and decides
 * whether they can be meaningfully expressed as domain failures.
 * ---
 * Translators MUST:
 * - Translate only well-known, intentional infra errors
 * - Never throw
 * - Never swallow unexpected errors
 * ---
 * Translators MUST NOT:
 * - Perform logging
 * - Perform retries
 * - Convert all errors into domain failures
 * ---
 * @template Failure - Domain failure type produced by this translator
 */
export interface InfrastructureErrorTranslator {
  /**
   * ---
   * Attempts to translate an infrastructure error into a domain failure.
   * ---
   * @param error - The raw error thrown by infrastructure code
   * (e.g. database driver, ORM, network layer).
   * @returns
   * - `{ translated: true, failure }` if the error is recognized
   *   and has a meaningful domain representation
   * - `{ translated: false }` if the error must be rethrown
   */
  translate(error: unknown): InfrastructureTranslation<Failure>;
  /**
   * ---
   * Attempts to translate an infrastructure error into a domain failure.
   * ---
   * @param error - The raw error thrown by infrastructure code
   * (e.g. database driver, ORM, network layer).
   * @returns
   * - `Failure` if the error is recognized
   *   and has a meaningful domain representation
   * - `rethrows` if the error must be rethrown
   */
  translateOrThrow(error: unknown): Failure;
}
