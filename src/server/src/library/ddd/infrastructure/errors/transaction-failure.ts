import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates issues with current transaction.
 */
export type TransactionFailure = {
  readonly _tag: 'TransactionFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const TransactionFailure = (code: string, cause: unknown): TransactionFailure =>
  infrastructureFailure({
    _tag: 'TransactionFailure',
    cause,
    code,
  });
