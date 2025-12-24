import type { InfrastructureFailure } from '../../infrastructure/infrastructure-error';
import type { UseCase as UC } from '../../application/use-case/use-case';
import type { Mapper as M } from '../../infrastructure/mapper/mapper';
import type { DomainFailure } from '../../domain/domain-error';
import type { Entity } from '../../domain/entity';
import type { Result } from '../../types/result';
import type { Either } from '../../types/either';
import type { Option } from '../../types/option';

/**
 * Base class for all controllers, responsible for formatting responses and
 * converting domain-layer objects into transport-layer payloads.
 *
 * Provides utility methods to handle `Result`, `Either`, and `Option` objects,
 * making it easier to write controllers that follow CQRS and DDD principles.
 *
 * This class provides a consistent `execute` entrypoint that handles
 * boilerplate request/response logic, including error handling and result mapping.
 *
 * Concrete subclasses must provide `implement`.
 */
export abstract class Controller<
  Request,
  Response,
  UseCase extends UC<unknown, unknown>,
  Mapper extends M<Entity<unknown>, unknown>,
> {
  /**
   * Constructor must be implemented by all subclasses with required arguments.
   * @param useCase - Use case to use inside implement method.
   * @param mapper - Mapper to use inside implement method.
   */
  constructor(
    protected readonly useCase: UseCase,
    protected readonly mapper: Mapper,
  ) {}
  /**
   * Template method. Concrete controllers must override this.
   * @param response - The output response object (generic).
   * @param status - The HTTP status code.
   * @param payload - The payload to send.
   */
  protected abstract send(
    response: Response,
    status: number,
    payload: unknown,
  ): void;

  /**
   *
   * Wrap core controller logic with surrounding logic (adapter responsibility).
   * This method is intended to be called by protocol-specific subclasses.
   * @param request - The input request object (generic).
   * @param response - The output response object (generic).
   */
  public async execute(request: Request, response: Response): Promise<void> {
    try {
      const result = await this.implement(request);

      const [status, payload] = this.handleResult(result);

      this.send(response, status, payload);
    } catch (error) {
      const [status, payload] = this.handleUnexpectedError(error);

      this.send(response, status, payload);
    }
  }

  /**
   * Template method. Concrete controllers must override this.
   * @param request - The input request object (generic).
   * @returns A domain-specific result or response payload.
   */
  protected abstract implement(request: Request): Promise<Result<unknown>>;

  /**
   * Handle a `Result` object and return an appropriate HTTP response.
   * @param result - The result to handle.
   * @param onSuccessStatus - Status code to return on success (defaults to 200).
   * @returns A tuple of [status code, payload].
   */

  protected handleResult<T>(
    result: Result<T>,
    onSuccessStatus = 200,
  ): [number, unknown] {
    return result.fold(
      () => [onSuccessStatus, result.value],
      () => this.handleError(result.error),
    );
  }

  /**
   * Handle an `Either` object and return an HTTP response.
   * @param either - The either to handle.
   * @param onRightStatus - Status code to return on success (defaults to 200).
   * @returns A tuple of [status code, payload].
   */
  protected handleEither<
    L extends InfrastructureFailure | DomainFailure | string,
    R,
  >(either: Either<L, R>, onRightStatus = 200): [number, unknown] {
    return either.fold(
      () => this.handleError(either.getLeft()),
      () => [onRightStatus, either.getRight()],
    );
  }

  /**
   * Handle an `Option` object and return an HTTP response.
   * @param option - The option to handle.
   * @param onSomeStatus - Status code to return if value is present (defaults to 200).
   * @returns A tuple of [status code, payload].
   */
  protected handleOption<T>(
    option: Option<T>,
    onSomeStatus = 200,
  ): [number, unknown] {
    return option.isSome()
      ? [onSomeStatus, option.get()]
      : this.handleError('Not found', 404);
  }

  /**
   * Default error handling. Can be overridden in subclasses to provide
   * custom status codes or error mapping logic.
   * @param error - The domain error to handle.
   * @param statusCode - Status code to return (defaults to 400).
   * @returns A tuple of [status code, payload].
   */
  protected handleError(
    error: InfrastructureFailure | DomainFailure | string,
    statusCode?: number,
  ): [number, unknown] {
    const message = typeof error === 'string' ? error : error.message;

    return [
      statusCode ?? 400,
      { message: message.length > 0 ? message : 'Bad request' },
    ];
  }

  /**
   * Default error handling. Can be overridden in subclasses to provide
   * custom status codes or error mapping logic.
   * @param error - The domain error to handle.
   * @returns A tuple of [status code, payload].
   */
  protected handleUnexpectedError(error: unknown): [number, unknown] {
    const message = error instanceof Error ? error.message : String(error);

    return [
      500,
      { message: message.length > 0 ? message : 'Internal server error' },
    ];
  }
}
