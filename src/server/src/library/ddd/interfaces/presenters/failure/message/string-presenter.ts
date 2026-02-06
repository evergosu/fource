import type { StringFailures } from 'server/library/ddd/domain/invariants/string/string';

import { assertNever } from 'server/library/ddd/utility/assert-never';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentStringFailure(failure: StringFailures): string {
  switch (failure._tag) {
    case 'MinimumLengthStringFailure': {
      return `${failure.name} must be at least ${failure.minimumLength.toString()} characters`;
    }

    case 'MaximumLengthStringFailure': {
      return `${failure.name} must be less than ${failure.maximumLength.toString()} characters`;
    }

    case 'FormatStringFailure': {
      return `${failure.name} must be in valid format`;
    }

    case 'EmptyStringFailure': {
      return `${failure.name} must be non-empty string`;
    }

    case 'EmailStringFailure': {
      return `${failure.name} must be a valid email`;
    }

    case 'ISOStringFailure': {
      return `${failure.name} must be a valid ISO 8601 string`;
    }

    case 'StringFailure': {
      return `${failure.name} must be a string`;
    }

    default: {
      return assertNever(failure);
    }
  }
}
