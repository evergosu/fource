import { Exception } from '../shared/exception';
import { Failure } from '../shared/failure';

/**
 * Base class for all domain-specific `Failures`.
 */
export abstract class DomainFailure extends Failure {}

/**
 * Base class for all domain-specific `Exceptions`.
 */
export abstract class DomainException extends Exception {}
