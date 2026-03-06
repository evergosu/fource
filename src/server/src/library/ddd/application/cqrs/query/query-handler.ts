import type { Task } from 'server/library/ddd/primitives';

import type { Query } from './query';

/**
 * ---
 * Handles execution of a CQRS Query.
 * ---
 * QueryHandlers implement the application logic required
 * to retrieve read models or projections from persistence.
 * ---
 * QueryHandlers must:
 * - Never mutate domain state.
 * - Never emit domain events.
 *
 * They may depend directly on read-model repositories
 * optimized for querying.
 * ---
 * @template Q - Query type.
 * @template Output - Query result type.
 * @template Failure - Possible failure type.
 */
export interface QueryHandler<
  Q extends Query<Output, Failure>,
  Output,
  Failure,
> {
  /**
   * ---
   * Executes the query.
   * ---
   * @param query - Query instance containing input parameters.
   */
  handle(query: Q): Task<Output, Failure>;
}
