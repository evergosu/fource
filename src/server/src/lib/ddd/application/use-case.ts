import { Result } from '../types/result';

/**
 * Represents a generic application use case.
 *
 * Use cases encapsulate all the application-specific business logic required to
 * perform a specific action or request. They orchestrate domain entities, services,
 * repositories, and return a `Result`.
 * @template Input - Type of the request object or input parameters.
 * @template Output - Type of the response object or output value.
 */
export abstract class UseCase<Input, Output> {
  /**
   * Wraps domain errors and calls business logic in `implement`.
   * @param input - The input parameters required for execution.
   * @returns A Promise of a Result containing either the expected output or an error.
   */
  public async execute(input: Input): Promise<Result<Output>> {
    try {
      return await this.implement(input);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Unknown error'),
      );
    }
  }

  /**
   * Actual implementation of the use case business logic.
   * Should not contain try/catch — all errors bubble to `execute()`.
   * @param input - The input parameters required for execution.
   */
  protected abstract implement(input: Input): Promise<Result<Output>>;
}

/**
 * Represents a write operation (Command) in CQRS.
 * @template Output - Type of the response object or output value (often void or ID of new entity).
 */
export abstract class CommandUseCase<Input, Output = void> extends UseCase<
  Input,
  Output
> {
  /**
   * Actual implementation of the use case business logic.
   * Should not contain try/catch — all errors bubble to `execute()`.
   * @param input - The input parameters required for execution.
   */
  protected abstract override implement(input: Input): Promise<Result<Output>>;
}

/**
 * Represents a read operation (Query) in CQRS.
 * @template Output - Type of the response object or output value (often DTOs or aggregates).
 */
export abstract class QueryUseCase<Input, Output> extends UseCase<
  Input,
  Output
> {
  /**
   * Actual implementation of the use case business logic.
   * Should not contain try/catch — all errors bubble to `execute()`.
   * @param input - The input parameters required for execution.
   */
  protected abstract override implement(input: Input): Promise<Result<Output>>;
}
