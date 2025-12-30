import type { UniqueIdentifier } from '../identifiers/unique-identifier';

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
