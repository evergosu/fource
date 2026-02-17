import {
  type InfrastructureFailure,
  infrastructureFailure,
} from '../../domain/issues/failure';

/**
 * ---
 * Indicates that a value exceeds column length (e.g. varchar(n)).
 */
export type StringDataRightTruncation = {
  readonly _tag: 'StringDataRightTruncation';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const StringDataRightTruncation = (
  code: string,
  cause: unknown,
): StringDataRightTruncation =>
  infrastructureFailure({
    _tag: 'StringDataRightTruncation',
    cause,
    code,
  });
