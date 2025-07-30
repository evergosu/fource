import { BaseError } from '../shared/base-error';

/**
 * Error representing an invariant violation
 * while accessing algebraic data type.
 */
export class DataTypeInvariantViolationError extends BaseError {}
