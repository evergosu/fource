import type { UniqueIdentifier } from '../identifiers/unique-identifier';
import type { Specification } from '../rules/specification';

import { DomainFailure } from '../domain-error';

/**
 * Failure representing an aggregate not found in the repository.
 */
export class AggregateNotFoundFailure extends DomainFailure {
  /**
   * Creates domain failure with optional identifier of the aggregate.
   * @param id - The identifier of the aggregate root.
   */
  constructor(public readonly id?: UniqueIdentifier) {
    super(
      id
        ? `Aggregate with ID ${id.toString()} was not found`
        : 'Aggregate was not found',
    );
  }
}

/**
 * Failure representing an aggregate already exists in the repository.
 */
export class AggregateAlreadyExistsFailure extends DomainFailure {
  /**
   * Creates domain failure with optional identifier of the aggregate.
   * @param id - The identifier of the aggregate root.
   */
  constructor(public readonly id?: UniqueIdentifier) {
    super(
      id
        ? `Aggregate with ID ${id.toString()} already exists`
        : 'Aggregate already exists',
    );
  }
}

/**
 * Failure representing a concurrency violation on an aggregate.
 *
 * This occurs when two or more processes attempt to modify the same aggregate
 * simultaneously, violating optimistic locking rules.
 */
export class AggregateConcurrencyFailure extends DomainFailure {
  /**
   * Creates domain failure with optional identifier of the aggregate.
   * @param id - The identifier of the aggregate root.
   */
  constructor(public readonly id?: UniqueIdentifier) {
    super(
      id
        ? `Concurrent modification detected for aggregate with ID ${id.toString()}. Operation aborted.`
        : 'Concurrent modification detected on aggregate. Operation aborted.',
    );
  }
}

/**
 * ---
 * Failure representing no aggregates satisfies given specification.
 */
export class NoAggregateSatisfiesSpecificationFailure extends DomainFailure {
  /**
   * ---
   * Creates domain failure with optional identifier of the aggregate.
   * @param specification - the name of given specification.
   */
  constructor(public readonly specification?: Specification<unknown>) {
    super(
      specification
        ? `No aggregates satisfies ${specification.toString()}`
        : 'No aggregates satisfies given specification',
    );
  }
}
