import { Exception } from '../shared/exception';
import { Failure } from '../shared/failure';

/**
 * Base class for all application-specific `Failures`.
 */
export abstract class ApplicationFailure extends Failure {}

/**
 * Base class for all application-specific `Exceptions`.
 */
export abstract class ApplicationException extends Exception {}
