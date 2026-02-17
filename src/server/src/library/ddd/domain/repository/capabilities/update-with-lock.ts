import type {
  InferSerializerDomain,
  Serializer,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type {
  AggregateAlreadyExistsFailure,
  AggregateConcurrencyFailure,
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from '../repository-errors';

/**
 * ---
 * Domain capability: Update aggregate using optimistic locking.
 * ---
 * This capability CANNOT exist without version awareness.
 */
export interface DomainUpdateWithLock<
  S extends Serializer<Entity<unknown>, unknown>,
> {
  readonly updateSerializer: S;

  /**
   * ---
   * Updates an aggregate from provided domain entity.
   * ---
   * - fails if an aggregate already exists in the persistance.
   * - fails if an aggregate versions missmatch.
   * ---
   * @param domain - entity to create.
   */
  updateWithLock(
    domain: InferSerializerDomain<S>,
  ): Task<
    InferSerializerDomain<S>['id'],
    | AggregateAlreadyExistsFailure
    | AggregatePersistenceFailure
    | AggregateConcurrencyFailure
    | AggregateNotFoundFailure
  >;
}
