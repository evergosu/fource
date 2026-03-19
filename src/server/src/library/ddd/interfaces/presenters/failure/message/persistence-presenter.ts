import type { PersistenceFailures } from 'server/library/ddd/domain/repository/repository-errors';

import { assertNever } from 'server/library/ddd/utility/assert-never';

/**
 * ---
 * Mapper for a failure messages into string format.
 * ---
 * @param failure - Failure with violation of an invariant.
 */
export function presentPersistenceFailure(failure: PersistenceFailures): string {
  switch (failure._tag) {
    case 'AggregateAlreadyExistsFailure': {
      return failure.id ? `Aggregate with ID ${failure.id.toString()} already exists` : 'Aggregate already exists';
    }

    case 'AggregateSpecificationFailure': {
      return failure.specification
        ? `No aggregates satisfies ${failure.specification.toString()}`
        : 'No aggregates satisfies given specification';
    }

    case 'AggregateConcurrencyFailure': {
      return failure.id
        ? `Concurrent modification detected on ${failure.id.toString()} aggregate. Operation aborted.`
        : 'Concurrent modification detected on aggregate. Operation aborted.';
    }

    case 'AggregatePersistenceFailure': {
      return `Persistence unavailable for ${failure.name}`;
    }

    case 'AggregateNotFoundFailure': {
      return failure.id ? `Aggregate with ID ${failure.id.toString()} was not found` : 'Aggregate was not found';
    }

    default: {
      return assertNever(failure);
    }
  }
}
