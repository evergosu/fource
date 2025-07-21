import { Result } from './result';

/**
 * Represents a generic application use case.
 *
 * Use cases encapsulate all the application-specific business logic required to
 * perform a specific action or request. They orchestrate domain entities, services,
 * repositories, and return a `Result`.
 *
 * @template Input - Type of the request object or input parameters.
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
