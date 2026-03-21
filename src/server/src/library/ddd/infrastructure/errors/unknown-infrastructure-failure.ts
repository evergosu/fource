import { type InfrastructureFailure, infrastructureFailure } from '../../domain/issues/failure';

/**
 * ---
 * Indicates unknown failure comming from infrastructure layer.
 */
export type UnknownInfrastructureFailure = {
  readonly _tag: 'UnknownInfrastructureFailure';
  readonly cause: unknown;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const UnknownInfrastructureFailure = (cause: unknown): UnknownInfrastructureFailure =>
  infrastructureFailure({
    _tag: 'UnknownInfrastructureFailure',
    cause,
  });
