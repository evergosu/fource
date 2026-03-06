import type { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Base transport controller.
 *
 * This class acts as an **application boundary adapter**
 * between external transport protocols (HTTP, RPC, CLI)
 * and the application layer.
 * ---
 * Responsibilities:
 * - Execute application use cases
 * - Convert `Task` results into transport responses
 * - Provide consistent error mapping
 * ---
 * The controller **does not contain domain logic**.
 * It only coordinates request parsing and response formatting.
 * ---
 * @template Request - incoming transport request
 * @template Response - outgoing transport response
 */
export abstract class Controller<Request, Response> {
  /**
   * ---
   * Entry point executed by transport adapters.
   *
   * Wraps controller execution with error handling
   * and ensures consistent response formatting.
   * ---
   * @param request - incoming request object
   * @param response - outgoing response object
   */
  async execute(request: Request, response: Response): Promise<void> {
    try {
      await this.handle(request)
        .match({
          fail: error => {
            const [status, payload] = this.handleFailure(error);

            this.send(response, status, payload);
          },
          ok: value => {
            const [status, payload] = this.handleSuccess(value);

            this.send(response, status, payload);
          },
        })
        .run();
    } catch (error) {
      const [status, payload] = this.handleUnexpected(error);

      this.send(response, status, payload);
    }
  }

  /**
   * ---
   * Executes controller logic.
   * ---
   * Implementations typically:
   * - construct commands/queries
   * - call command/query buses
   * ---
   * @param request - transport request
   */
  protected abstract handle(request: Request): Task<unknown, unknown>;

  /**
   * ---
   * Converts successful result into response payload.
   * ---
   * @param value - successful result
   */
  protected handleSuccess(value: unknown): [number, unknown] {
    return [200, value];
  }

  /**
   * ---
   * Converts application failures into HTTP responses.
   * ---
   * @param failure - application failure
   */
  protected handleFailure(failure: unknown): [number, unknown] {
    return [400, { message: String(failure) }];
  }

  /**
   * ---
   * Handles unexpected runtime errors.
   * ---
   * @param error - thrown exception
   */
  protected handleUnexpected(error: unknown): [number, unknown] {
    return [500, { message: String(error) }];
  }

  /**
   * ---
   * Sends the final response.
   *
   * Implemented by transport-specific controllers
   * (HTTP, GraphQL, RPC, etc.).
   * ---
   * @param response - response object
   * @param status - HTTP status code
   * @param payload - serialized payload
   */
  protected abstract send(
    response: Response,
    status: number,
    payload: unknown,
  ): void;
}
