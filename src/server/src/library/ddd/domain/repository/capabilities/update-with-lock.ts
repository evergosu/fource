import type {
  InferSerializerDomain,
  Serializer as S,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../policy/error-policy';
import type { AggregateConcurrencyFailure } from '../repository-errors';

/**
 * ---
 * Domain capability: Update aggregate using optimistic locking.
 * ---
 * This capability CANNOT exist without version awareness.
 */
export interface DomainUpdateWithLock<
  Serializer extends S<Domain, unknown>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferSerializerDomain<Serializer>,
> extends RequiresErrorPolicy<UPDATE_WITH_LOCK_OPERATION, FailureMap> {
  /**
   * ---
   * Updates an aggregate from provided domain entity.
   * ---
   * @param domain - entity to create.
   */
  updateWithLock(
    domain: Domain,
  ): Task<
    Domain['id'],
    FailureMap[UPDATE_WITH_LOCK_OPERATION] | AggregateConcurrencyFailure
  >;
}

export type UPDATE_WITH_LOCK_OPERATION = 'updateWithLock';
