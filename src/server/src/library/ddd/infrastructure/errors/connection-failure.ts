import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates unexpected fail of connection to server.
 */
export type ConnectionFailure = {
  readonly _tag: 'ConnectionFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const ConnectionFailure = (code: string, cause: unknown): ConnectionFailure =>
  infrastructureFailure({
    _tag: 'ConnectionFailure',
    cause,
    code,
  });
