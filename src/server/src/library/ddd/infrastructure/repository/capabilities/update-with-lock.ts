import type {
  AggregateConcurrencyFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/errors';
import type {
  InferSerializerDomain,
  Serializer,
  Task,
} from 'server/library/ddd/primitives';
import type { OptimisticLockExecutor } from 'server/application/drizzle-lock';

/**
 * ---
 * Capability: Update aggregate using optimistic locking.
 * ---
 * This capability CANNOT exist without version awareness.
 */
export interface UpdateWithLock<S extends Serializer<unknown, unknown>> {
  readonly optimisticLockExecutor: OptimisticLockExecutor;
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
  ): Task<void, AggregateConcurrencyFailure | AggregateNotFoundFailure>;
}
