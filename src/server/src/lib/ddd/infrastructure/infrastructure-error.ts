import { Exception } from '../shared/exception';
import { Failure } from '../shared/failure';

/**
 * Base class for all infrastructure-specific `Failures`.
 */
export abstract class InfrastructureFailure extends Failure {}

/**
 * Base class for all infrastructure-specific `Exceptions`.
 */
export abstract class InfrastructureException extends Exception {}
