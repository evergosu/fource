import { Result } from './result';

/**
 * Represents a generic application use case.
 *
 * Use cases encapsulate all the application-specific business logic required to
 * perform a specific action or request. They orchestrate domain entities, services,
 * repositories, and return a `Result`.
 *
 * @template Output - Type of the response object or output value.
 */
export abstract class UseCase<Output> {
  /**
   * Executes the use case logic.
   *
   * @param input - The input parameters required for execution.
   * @returns A Promise of a Result containing either the expected output or an error.
   */
  abstract execute(input: unknown): Promise<Result<Output>>;
}

/**
 * Represents a write operation (Command) in CQRS.
 *
 * @template Output - Type of the response object or output value (often void or ID of new entity).
 */
export abstract class CommandUseCase<Output = void> extends UseCase<Output> {
  /**
   * Executes the command use case logic.
   *
   * @param input - The input parameters required for execution.
   * @returns A Promise of a Result containing either the expected output or an error.
   */
  abstract override execute(input: unknown): Promise<Result<Output>>;
}

/**
 * Represents a read operation (Query) in CQRS.
 *
 * @template Output - Type of the response object or output value (often DTOs or aggregates).
 */
export abstract class QueryUseCase<Output> extends UseCase<Output> {
  /**
   * Executes the command use case logic.
   *
   * @param input - The input parameters required for execution.
   * @returns A Promise of a Result containing either the expected output or an error.
   */
  abstract override execute(input: unknown): Promise<Result<Output>>;
}
