import { Exception } from '../issues/exception';
import { Failure } from '../issues/failure';

/**
 * Base class for all application-specific `Failures`.
 */
export abstract class ApplicationFailure extends Failure {}

/**
 * Base class for all application-specific `Exceptions`.
 */
export abstract class ApplicationException extends Exception {}
