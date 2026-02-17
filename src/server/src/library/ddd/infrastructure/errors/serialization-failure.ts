import {
  type InfrastructureFailure,
  infrastructureFailure,
} from '../../domain/issues/failure';

/**
 * ---
 * Indicates a transaction fail due to serialization anomaly.
 * Typically retriable.
 */
export type SerializationFailure = {
  readonly _tag: 'SerializationFailure';
  readonly cause: unknown;
  readonly code: string;
} & InfrastructureFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const SerializationFailure = (
  code: string,
  cause: unknown,
): SerializationFailure =>
  infrastructureFailure({
    _tag: 'SerializationFailure',
    cause,
    code,
  });
