import { Exception } from '../issues/exception';

/**
 * Exception representing an invariant violation
 * while accessing algebraic data type.
 */
export class DataTypeInvariantViolationException extends Exception {}
