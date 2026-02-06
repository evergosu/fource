import type { UndefinedFailure } from 'server/library/ddd/domain/invariants/undefined/undefined';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentUndefinedFailure(failure: UndefinedFailure): string {
  return `${failure.name} must be defined`;
}
