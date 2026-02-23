import type {
  InferSerializerDomain,
  Serializer as S,
  Entity,
  Task,
} from 'server/library/ddd/primitives';

import type {
  RepositoryFailureMap as RFM,
  RequiresErrorPolicy,
} from '../repository-error-policy';

/**
 * ---
 * Domain capability: Create an aggregate from provided domain entity.
 */
export interface DomainCreate<
  Serializer extends S<Domain, unknown>,
  FailureMap extends RFM,
  Domain extends Entity<unknown> = InferSerializerDomain<Serializer>,
> extends RequiresErrorPolicy<CREATE_OPERATION, FailureMap> {
  /**
   * ---
   * Creates an aggregate from provided domain entity.
   * ---
   * @param entity - entity to create.
   */
  create(entity: Domain): Task<void, FailureMap[CREATE_OPERATION]>;
}

export type CREATE_OPERATION = 'create';
