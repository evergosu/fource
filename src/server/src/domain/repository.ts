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

/**
 * Base interface for repositories in the domain layer.
 * @template T - The concrete AggregateRoot type handled by the repository.
 */
export interface Repository<T extends AggregateRoot<unknown>> {
  /**
   * Retrieves an aggregate root by ID.
   * @param id - The unique identifier of the aggregate.
   * @returns Either an `AggregateNotFoundError` or the aggregate.
   */
  findById(id: T['id']): Promise<Either<AggregateNotFoundError, T>>;

  /**
   * Finds all aggregates related to this repository.
   * @returns Either an `AggregateNotFoundError` or the aggregates.
   */
  findAll(): Promise<Either<AggregateNotFoundError, T[]>>;

  /**
   * Finds all aggregates that match the given specification.
   * @param specification - Optional filtering logic.
   * @returns Either an `AggregateNotFoundError` or the aggregates.
   */
  findBySpecification(
    specification?: Specification<T>,
  ): Promise<Either<AggregateNotFoundError, T[]>>;

  /**
   * Saves or updates the aggregate in the underlying store.
   * @param aggregate - The aggregate to persist.
   * @returns `Result.ok()` on success, or `Result.fail()` with an error.
   */
  save(aggregate: T): Promise<Result<void>>;

  /**
   * Deletes the aggregate from the store.
   * @param id - The unique identifier of the aggregate to delete.
   * @returns `Result.ok()` on success, or `Result.fail()` with an error.
   */
  delete(id: T['id']): Promise<Result<void>>;
}
