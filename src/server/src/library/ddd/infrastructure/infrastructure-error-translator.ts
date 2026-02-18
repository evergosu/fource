import type {
  InfrastructureFailure,
  DomainFailure,
} from '../domain/issues/failure';

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
 * - Never swallow unexpected errors
 * - Never throw
 * ---
 * Translators MUST NOT:
 * - Perform logging
 * - Perform retries
 */
export interface InfrastructureErrorTranslator<
  InfraFailures extends InfrastructureFailure,
  DomainFailures extends DomainFailure,
> {
  /**
   * ---
   * Attempts to translate an infrastructure error into a domain failure.
   * ---
   * @param error - The error thrown by infrastructure code
   * (e.g. database driver, ORM, network layer) and decoded into `InfrastructureFailure`
   */
  translate(error: InfraFailures): DomainFailures;
}
