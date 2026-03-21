import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates a CHECK constraint condition evaluates to false.
 * `constraint` contains the check constraint name.
 */
export type CheckViolationFailure = {
  readonly _tag: 'CheckViolationFailure';
  readonly constraint: string;
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const CheckViolationFailure = (code: string, constraint: string, cause: unknown): CheckViolationFailure =>
  infrastructureFailure({
    _tag: 'CheckViolationFailure',
    constraint,
    cause,
    code,
  });
