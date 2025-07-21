import type { UniqueIdentifier } from './unique-identifier';
import type { AggregateRoot } from './aggregate-root';
import type { Specification } from './specification';
import type { Either } from './either';
import type { Result } from './result';

import { DomainError } from './domain-error';

/**
 * Error representing an aggregate not found in the repository.
 */
export class AggregateNotFoundError extends DomainError {
  constructor(public readonly id?: UniqueIdentifier) {
    super(
      id
        ? `Aggregate with ID ${id.toString()} was not found`
        : 'Aggregate was not found',
    );
  }
}

/**
 * Base interface for repositories in the domain layer.
 *
 * @template T - The concrete AggregateRoot type handled by the repository.
 */
export interface Repository<T extends AggregateRoot<unknown>> {
  /**
   * Retrieves an aggregate root by ID.
   *
   * Returns Either a `AggregateNotFoundError` or the aggregate.
   *
   * @param id - The unique identifier of the aggregate.
   */
  findById(id: T['id']): Promise<Either<AggregateNotFoundError, T>>;

  /**
   * Finds all aggregates related to this repository.
   *
   * Returns Either a `AggregateNotFoundError` or the aggregates.
   */
  findAll(): Promise<Either<AggregateNotFoundError, T[]>>;

  /**
   * Finds all aggregates that match the given specification.
   *
   * Returns Either a `AggregateNotFoundError` or the aggregates.
   *
   * @param specification - Optional filtering logic.
   */
  findBySpecification(
    specification?: Specification<T>,
  ): Promise<Either<AggregateNotFoundError, T[]>>;

  /**
   * Saves or updates the aggregate in the underlying store.
   *
   * Returns Result.ok() on success, or Result.fail() with an error.
   *
   * @param aggregate - The aggregate to persist.
   */
  save(aggregate: T): Promise<Result<void>>;

  /**
   * Deletes the aggregate from the store.
   *
   * Returns Result.ok() on success, or Result.fail() with an error.
   *
   * @param id - The unique identifier of the aggregate to delete.
   */
  delete(id: T['id']): Promise<Result<void>>;
}
