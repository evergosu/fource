import type { Specification } from '../../domain/rules/specification';
import type { AggregateNotFoundFailure } from './repository-errors';
import type { AggregateRoot } from '../../domain/aggregate-root';
import type { Result } from '../../types/result';

/**
 * Base interface for repositories in the domain layer.
 * @template T - The concrete AggregateRoot type handled by the repository.
 */
export interface Repository<T extends AggregateRoot<unknown>> {
  /**
   * Retrieves an aggregate root by ID.
   * @param id - The unique identifier of the aggregate.
   * @returns `Result` with an `AggregateNotFoundError` or the aggregate.
   */
  findById(id: T['id']): Promise<Result<T, AggregateNotFoundFailure>>;

  /**
   * Finds all aggregates related to this repository.
   * @returns `Result` with an `AggregateNotFoundError` or the aggregates.
   */
  findAll(): Promise<Result<T[], AggregateNotFoundFailure>>;

  /**
   * Finds all aggregates that match the given specification.
   * @param specification - Optional filtering logic.
   * @returns `Result` with an `AggregateNotFoundError` or the aggregates.
   */
  findBySpecification(
    specification?: Specification<T>,
  ): Promise<Result<T[], AggregateNotFoundFailure>>;

  /**
   * Saves or updates the aggregate in the underlying store.
   * @param aggregate - The aggregate to persist.
   * @returns `Result.ok()` on success, or `Result.fail()` with an error.
   */
  save(aggregate: T): Promise<Result<void, AggregateNotFoundFailure>>;

  /**
   * Deletes the aggregate from the store.
   * @param id - The unique identifier of the aggregate to delete.
   * @returns `Result.ok()` on success, or `Result.fail()` with an error.
   */
  delete(id: T['id']): Promise<Result<void, AggregateNotFoundFailure>>;
}
