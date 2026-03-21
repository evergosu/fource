import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';

import type { GET_BY_SPECIFICATION_OPERATION } from './capabilities/get-by-specification';
import type { UPDATE_WITH_LOCK_OPERATION } from './capabilities/update-with-lock';
import type { CREATE_BATCH_OPERATION } from './capabilities/create-batch';
import type { COUNT_BY_ID_OPERATION } from './capabilities/count-by-id';
import type { GET_BY_ID_OPERATION } from './capabilities/get-by-id';
import type { GET_ALL_OPERATION } from './capabilities/get-all';
import type { CREATE_OPERATION } from './capabilities/create';
import type { DELETE_OPERATION } from './capabilities/delete';
import type { UPDATE_OPERATION } from './capabilities/update';
import type { DomainFailure } from '../issues/failure';

export type Operation =
  | GET_BY_SPECIFICATION_OPERATION
  | UPDATE_WITH_LOCK_OPERATION
  | CREATE_BATCH_OPERATION
  | COUNT_BY_ID_OPERATION
  | GET_BY_ID_OPERATION
  | GET_ALL_OPERATION
  | DELETE_OPERATION
  | UPDATE_OPERATION
  | CREATE_OPERATION;

/**
 * ---
 * Maps each repository operation to the set of domain failures
 * that the operation is allowed to return.
 * ---
 * This type defines the failure contract between the repository
 * and the application layer.
 * ---
 * All operations defined in {@link Operation} must be present.
 */
export type RepositoryFailureMap = Partial<Record<Operation, DomainFailure>>;

/**
 * ---
 * Translates infrastructure-level failures into domain-level failures.
 * ---
 * Translation is operation-aware: the resulting failure type depends
 * on the repository operation being executed.
 * ---
 * @template RFM - Repository failure map defining the allowed
 *                 domain failures per operation.
 * @template IF  - Infrastructure failure type.
 */
export interface RepositoryErrorPolicy<RFM extends RepositoryFailureMap, IF = InfrastructureFailures> {
  /**
   * ---
   * Converts an infrastructure failure into a domain failure
   * appropriate for the given operation.
   * ---
   * The returned failure type is strictly derived from the
   * operation key.
   * ---
   * @param operation - Repository operation being executed.
   */
  translate<K extends keyof RFM>(operation: K): (error: IF) => RFM[K];
}

/**
 * ---
 * Capability constraint requiring that a repository provides
 * an error policy supporting a specific operation.
 * ---
 * This allows capabilities to declare which operation key
 * they depend on, without requiring separate translator fields.
 * ---
 * @template O  - Required operation key.
 * @template FM - Repository failure map.
 */
export interface RequiresErrorPolicy<O extends Operation, FM extends RepositoryFailureMap> {
  /**
   * ---
   * Error translation policy supporting at least
   * the required operation.
   */
  readonly errorPolicy: RepositoryErrorPolicy<Record<O, FM[O]> & FM>;
}
