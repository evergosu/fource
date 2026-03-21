import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates a deadlock at database.
 * Transaction must be retried.
 */
export type DeadlockFailure = {
  readonly _tag: 'DeadlockFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const DeadlockFailure = (code: string, cause: unknown): DeadlockFailure =>
  infrastructureFailure({
    _tag: 'DeadlockFailure',
    cause,
    code,
  });
