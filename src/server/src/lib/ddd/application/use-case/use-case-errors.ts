import { ApplicationError } from '../application-error';

/**
 * Error indicating that an unexpected error has happened
 * during execution of current use case.
 * @example throw new UseCaseExecutionError('CreateUserUseCase');
 */
export class UseCaseExecutionError extends ApplicationError {
  /**
   * Creates usecase error with provided error message.
   * @param useCaseName The name of the usecase.
   */
  constructor(public readonly useCaseName: string) {
    super(`Unknown error during ${useCaseName} execution`);
  }
}
