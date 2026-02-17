import type {
  InferSerializerDomain,
  Serializer,
  Task,
} from 'server/library/ddd/primitives';

import type {
  AggregateAlreadyExistsFailure,
  AggregatePersistenceFailure,
} from '../repository-errors';

/**
 * ---
 * Domain capability: Create an aggregate from provided domain entity.
 */
export interface DomainCreate<S extends Serializer<unknown, unknown>> {
  readonly insertSerializer: S;

  /**
   * ---
   * Creates an aggregate from provided domain entity.
   * ---
   * - fails if an aggregate already exists in the persistance.
   * ---
   * @param domain - entity to create.
   */
  create(
    domain: InferSerializerDomain<S>,
  ): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure>;
}
