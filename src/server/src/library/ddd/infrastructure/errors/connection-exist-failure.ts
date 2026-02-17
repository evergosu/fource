import {
  type InfrastructureFailure,
  infrastructureFailure,
} from '../../domain/issues/failure';

/**
 * ---
 * Indicates an attempt to use a closed or invalid connection.
 */
export type ConnectionExistFailure = {
  readonly _tag: 'ConnectionExistFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const ConnectionExistFailure = (
  code: string,
  cause: unknown,
): ConnectionExistFailure =>
  infrastructureFailure({
    _tag: 'ConnectionExistFailure',
    cause,
    code,
  });
