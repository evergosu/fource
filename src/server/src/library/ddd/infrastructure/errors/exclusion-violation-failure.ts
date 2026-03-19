import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates an violation of an exclusion constraint (USING gist, etc.).
 * `constraint` contains the constraint name.
 */
export type ExclusionViolationFailure = {
  readonly _tag: 'ExclusionViolationFailure';
  readonly constraint: string;
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const ExclusionViolationFailure = (
  code: string,
  constraint: string,
  cause: unknown,
): ExclusionViolationFailure =>
  infrastructureFailure({
    _tag: 'ExclusionViolationFailure',
    constraint,
    cause,
    code,
  });
