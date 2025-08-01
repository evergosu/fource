import { Exception } from '../issues/exception';
import { Failure } from '../issues/failure';

/**
 * Base class for all infrastructure-specific `Failures`.
 */
export abstract class InfrastructureFailure extends Failure {}

/**
 * Base class for all infrastructure-specific `Exceptions`.
 */
export abstract class InfrastructureException extends Exception {}
