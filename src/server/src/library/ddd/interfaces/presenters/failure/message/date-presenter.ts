import type { DateFailures } from 'server/library/ddd/domain/invariants/date/date';

import { assertNever } from 'server/library/ddd/utility/assert-never';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentDateFailure(failure: DateFailures): string {
  switch (failure._tag) {
    case 'BeforeDateFailure': {
      return `${failure.name} must come before ${failure.threshold.toLocaleDateString()}`;
    }

    case 'FutureDateFailure': {
      return `${failure.name} must be in the future`;
    }

    case 'AfterDateFailure': {
      return `${failure.name} must come after ${failure.threshold.toLocaleDateString()}`;
    }

    case 'PastDateFailure': {
      return `${failure.name} must be in the past`;
    }

    case 'DateFailure': {
      return `${failure.name} must be a valid Date object`;
    }

    default: {
      return assertNever(failure);
    }
  }
}
