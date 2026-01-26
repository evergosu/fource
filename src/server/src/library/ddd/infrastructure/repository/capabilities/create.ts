import type {
  InferSerializerDomain,
  Serializer,
  Task,
} from 'server/library/ddd/primitives';
import type { AggregateAlreadyExistsFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Capability: Create an aggregate from provided domain entity.
 */
export interface Create<S extends Serializer<unknown, unknown>> {
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
  ): Task<void, AggregateAlreadyExistsFailure>;
}
