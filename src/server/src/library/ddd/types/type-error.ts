import { Exception } from '../domain/issues/exception';

/**
 * Exception representing an invariant violation
 * while accessing algebraic data type.
 */
// eslint-disable-next-line prettier/prettier
export class DataTypeInvariantViolationException extends Exception { }
