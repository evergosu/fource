import type { InferSerializerDomain, Serializer as S, Entity, Task } from 'server/library/ddd/primitives';

import type { RepositoryFailureMap as RFM, RequiresErrorPolicy } from '../repository-error-policy';

/**
 * ---
 * Domain capability: Create a few aggregates from provided domain entity.
 */
export interface DomainCreateBatch<
  Serializer extends S<Domain, unknown>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferSerializerDomain<Serializer>,
> extends RequiresErrorPolicy<CREATE_BATCH_OPERATION, FailureMap> {
  /**
   * ---
   * Creates a few aggregates from provided domain entity.
   * ---
   * @param entities - entity to create.
   */
  createBatch(entities: Domain[]): Task<void, FailureMap[CREATE_BATCH_OPERATION]>;
}

export type CREATE_BATCH_OPERATION = 'createBatch';
