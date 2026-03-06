/**
 * ---
 * Marker interface representing a CQRS query.
 * ---
 * Queries represent read-only operations that retrieve data
 * from the system without modifying domain state.
 *
 * Queries are typically handled by QueryHandlers and dispatched
 * through a QueryBus.
 * ---
 * @template Output - Data returned by the query.
 * @template Failure - Possible failure type.
 */
export type Query<_Output, _Failure> = object;
