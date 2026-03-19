import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates a fail of foreign key constraint.
 * `constraint` contains the foreign key name.
 */
export type ForeignKeyViolationFailure = {
  readonly _tag: 'ForeignKeyViolationFailure';
  readonly constraint: string;
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const ForeignKeyViolationFailure = (
  code: string,
  constraint: string,
  cause: unknown,
): ForeignKeyViolationFailure =>
  infrastructureFailure({
    _tag: 'ForeignKeyViolationFailure',
    constraint,
    cause,
    code,
  });
