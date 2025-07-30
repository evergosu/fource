import { BaseError } from '../shared/base-error';

/**
 * Base class for all domain-specific errors.
 *
 * Domain errors represent business rule violations, invariant failures,
 * or invalid states discovered during domain model validation.
 *
 * All domain errors are safe for clients to consume, loggable, and can be localized.
 */
export abstract class DomainError extends BaseError {}
