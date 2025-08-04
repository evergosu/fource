import { Exception } from '../issues/exception';
import { Failure } from '../issues/failure';

/**
 * Base class for all domain-specific `Failures`.
 */
export abstract class DomainFailure extends Failure {}

/**
 * Base class for all domain-specific `Exceptions`.
 */
export abstract class DomainException extends Exception {}
