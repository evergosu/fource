import { ApplicationException } from '../application-error';

/**
 * Exception indicating that an unexpected error has happened
 * during execution of current use case.
 */
export class UseCaseExecutionException extends ApplicationException {
  /**
   * Creates usecase exception with provided error message.
   * @param useCaseName The name of the usecase.
   * @param error optional error, caused the exception.
   */
  constructor(
    public readonly useCaseName: string,
    error?: unknown,
  ) {
    super(
      error instanceof Error
        ? `Unknown exception during ${useCaseName} execution, caused by: ${error.message}`
        : `Unknown exception during ${useCaseName} execution`,
    );
  }
}
