import {
  type InfrastructureFailure,
  infrastructureFailure,
} from '../../domain/issues/failure';

/**
 * ---
 * Indicates issues with datetime input string parsing.
 */
export type InvalidDatetimeFormatFailure = {
  readonly _tag: 'InvalidDatetimeFormatFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const InvalidDatetimeFormatFailure = (
  code: string,
  cause: unknown,
): InvalidDatetimeFormatFailure =>
  infrastructureFailure({
    _tag: 'InvalidDatetimeFormatFailure',
    cause,
    code,
  });
