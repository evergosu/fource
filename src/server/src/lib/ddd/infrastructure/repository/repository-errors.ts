import type { UniqueIdentifier } from '../../domain/identifiers/unique-identifier';

import { InfrastructureError } from '../infrastructure-error';

/**
 * Error representing an aggregate not found in the repository.
 */
export class AggregateNotFoundError extends InfrastructureError {
  /**
   * Creates domain error with optional identifier of the aggregate.
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
