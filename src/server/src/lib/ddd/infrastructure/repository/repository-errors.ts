import type { UniqueIdentifier } from '../../domain/identifiers/unique-identifier';

import { InfrastructureFailure } from '../infrastructure-error';

/**
 * Failure representing an aggregate not found in the repository.
 */
export class AggregateNotFoundFailure extends InfrastructureFailure {
  /**
   * Creates infrastructure failure with optional identifier of the aggregate.
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
