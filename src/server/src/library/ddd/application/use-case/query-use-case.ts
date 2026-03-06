import type { ApplicationFailure } from 'server/library/ddd/domain/issues/failure';
import type { Task } from 'server/library/ddd/primitives';

/**
 * ---
 * Base abstraction for query-oriented application use cases.
 *
 * This class standardizes the execution pipeline for all
 * query use cases in the application layer.
 * ---
 * Design constraints:
 *
 * - infrastructure must not leak into use cases
 * - domain and infrastructure failures must be translated
 * to application failures at the boundary
 * ---
 * @template Input - Input payload required by the use case.
 * @template Output - Successful result returned by the use case.
 * @template Failure - Application failure type produced by the use case.
 */
export abstract class QueryUseCase<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  Input,
  Output,
  Failure extends ApplicationFailure,
> {
  /**
   * ---
   * Implements the core business logic of the use case.
   * ---
   * Subclasses must implement this method and perform the query.
   *
   * ---
   * @param input - Input payload.
   */
  protected abstract execute(input: Input): Task<Output, Failure>;
}
