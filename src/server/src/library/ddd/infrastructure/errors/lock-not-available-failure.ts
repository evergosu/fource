import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates that transaction can not obtain a lock.
 * Transaction must be retried.
 */
export type LockNotAvailableFailure = {
  readonly _tag: 'LockNotAvailableFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const LockNotAvailableFailure = (code: string, cause: unknown): LockNotAvailableFailure =>
  infrastructureFailure({
    _tag: 'LockNotAvailableFailure',
    cause,
    code,
  });
