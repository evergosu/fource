import type { NullishFailure } from 'server/library/ddd/domain/invariants/defined/defined';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentNullishFailure(failure: NullishFailure): string {
  return `${failure.name} must be defined`;
}
