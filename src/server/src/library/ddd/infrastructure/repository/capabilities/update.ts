import type {
  InferSerializerDomain,
  Serializer,
  Task,
} from 'server/library/ddd/primitives';
import type { AggregateNotFoundFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Capability: Update aggregate using provided domain entity.
 */
export interface Update<S extends Serializer<unknown, unknown>> {
  readonly updateSerializer: S;

  /**
   * ---
   * Updates an aggregate from provided domain entity.
   * ---
   * - fails if an aggregate does not exist in the persistance.
   * ---
   * @param domain - entity to update.
   */
  update(
    domain: InferSerializerDomain<S>,
  ): Task<void, AggregateNotFoundFailure>;
}
