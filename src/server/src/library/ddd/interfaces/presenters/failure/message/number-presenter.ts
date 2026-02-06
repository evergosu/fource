import type { NumberFailures } from 'server/library/ddd/domain/invariants/number/number';

import { assertNever } from 'server/library/ddd/utility/assert-never';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentNumberFailure(failure: NumberFailures): string {
  switch (failure._tag) {
    case 'OutOfRangeNumberFailure': {
      return `${failure.name} must be between ${failure.minimum.toString()} and ${failure.maximum.toString()}`;
    }

    case 'NumberFailure': {
      return `${failure.name} must be a number`;
    }

    default: {
      return assertNever(failure);
    }
  }
}
