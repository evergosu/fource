import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates an attempt to write a NULL value to a NOT NULL column.
 * `column` identifies the offending column.
 */
export type NotNullViolationFailure = {
  readonly _tag: 'NotNullViolationFailure';
  readonly column: string;
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const NotNullViolationFailure = (code: string, column: string, cause: unknown): NotNullViolationFailure =>
  infrastructureFailure({
    _tag: 'NotNullViolationFailure',
    column,
    cause,
    code,
  });
