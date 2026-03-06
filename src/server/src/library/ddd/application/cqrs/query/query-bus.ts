import type { Task } from 'server/library/ddd/primitives';

import { Exception } from 'server/library/ddd/domain/issues/exception';

import type { QueryMiddleware } from './query-middleware';
import type { QueryHandler } from './query-handler';
import type { Query } from './query';

/**
 * ---
 * In-memory implementation of a CQRS QueryBus.
 * ---
 * Responsibilities:
 * - registers QueryHandlers
 * - dispatches queries
 * - composes middleware pipeline
 */
export class InMemoryQueryBus {
  private readonly handlers = new Map<
    string,
    QueryHandler<object, unknown, unknown>
  >();

  private readonly middleware: QueryMiddleware[] = [];

  /**
   * ---
   * Registers a handler for a query type.
   * ---
   * @param query - Query constructor.
   * @param handler - Handler responsible for executing the query.
   */
  register<Q extends Query<O, F>, O, F>(
    query: new (...arguments_: never) => Q,
    handler: QueryHandler<Q, O, F>,
  ): void {
    this.handlers.set(query.name, handler);
  }

  /**
   * ---
   * Adds middleware to the query pipeline.
   * ---
   * @param middleware - Query middleware.
   */
  use(middleware: QueryMiddleware<unknown>): void {
    this.middleware.push(middleware);
  }

  /**
   * ---
   * Composes middleware pipeline.
   *
   * Middleware executes in reverse registration order.
   * ---
   * @param query - Query being dispatched.
   * @param handler - Query handler invocation.
   */
  private composeMiddleware<O, F>(
    query: Query<O, F>,
    handler: () => Task<O, F>,
  ): () => Task<O, F> {
    // eslint-disable-next-line unicorn/no-array-reduce
    return this.middleware.toReversed().reduce((next, middleware) => {
      return () => middleware.execute(query, next);
    }, handler);
  }

  /**
   * ---
   * Dispatches query through middleware pipeline
   * and into its registered handler.
   * ---
   * @param query - Query instance.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  dispatch<Q extends Query<Output, Failure>, Output, Failure>(
    query: Q,
  ): Task<Output, Failure> {
    const handler = this.handlers.get(query.constructor.name) as
      | QueryHandler<Q, Output, Failure>
      | undefined;

    if (!handler) {
      throw new QueryHandlerException(
        `No handler registered for ${query.constructor.name}`,
      );
    }

    const pipeline = this.composeMiddleware(query, () => handler.handle(query));

    return pipeline();
  }
}

// eslint-disable-next-line prettier/prettier
class QueryHandlerException extends Exception { }
