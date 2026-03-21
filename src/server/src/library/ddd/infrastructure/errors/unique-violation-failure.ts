import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates that a UNIQUE or PRIMARY KEY constraint is violated.
 * `constraint` contains the name of the violated index/constraint.
 */
export type UniqueViolationFailure = {
  readonly _tag: 'UniqueViolationFailure';
  readonly constraint: string;
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const UniqueViolationFailure = (code: string, constraint: string, cause: unknown): UniqueViolationFailure =>
  infrastructureFailure({
    _tag: 'UniqueViolationFailure',
    constraint,
    cause,
    code,
  });
