import type { EmptyArrayFailure } from 'server/library/ddd/domain/invariants/array/empty-array';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentArrayFailure(failure: EmptyArrayFailure): string {
  return `${failure.name} must be a non-empty array`;
}
