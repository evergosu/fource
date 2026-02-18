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

/**
 * ---
 * Domain capability: Update aggregate using provided domain entity.
 */
export interface DomainUpdate<
  Serializer extends S<Domain, unknown>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferSerializerDomain<Serializer>,
> extends RequiresErrorPolicy<UPDATE_OPERATION, FailureMap> {
  /**
   * ---
   * Updates an aggregate from provided domain entity.
   * ---
   * @param domain - entity to update.
   */
  update(domain: Domain): Task<void, FailureMap[UPDATE_OPERATION]>;
}

export type UPDATE_OPERATION = 'update';
