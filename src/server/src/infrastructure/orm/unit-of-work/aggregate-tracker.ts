import type { DomainEvent } from 'server/library/ddd/domain/events/domain-event';
import type { AggregateRoot } from 'server/library/ddd/primitives';

/**
 * ---
 * Tracks mutated aggregates within the current application execution scope
 * (typically a Unit of Work / transaction) and collects their domain events.
 *
 * This class acts as a lightweight coordination mechanism between domain
 * aggregates and infrastructure components responsible for event publication
 * (e.g., an Outbox repository).
 *
 * Rationale
 * ---
 * Aggregates raise domain events during state transitions. Persisting or
 * publishing these events immediately from the aggregate is undesirable
 * because:
 *
 * - The aggregate should remain infrastructure-agnostic.
 * - Events should only be published if the transaction commits.
 * - Multiple aggregates may participate in a single transaction.
 *
 * The tracker solves this by:
 *
 * 1. Recording aggregates that were modified during the use case execution.
 * 2. Extracting domain events from those aggregates after the domain logic
 *    completes but before the transaction commits.
 * 3. Clearing its internal state to avoid event duplication.
 *
 * Typical flow
 * ---
 * 1. Application service mutates an aggregate.
 * 2. The aggregate raises domain events internally.
 * 3. The aggregate is registered via {@link AggregateTracker.track}.
 * 4. After domain logic completes, {@link AggregateTracker.collectEvents} extracts all
 *    accumulated events.
 * 5. Events are persisted to an outbox or dispatched to an event bus.
 * ---
 * The tracker does not:
 *
 * - Persist events
 * - Dispatch events
 * - Perform deduplication across transactions
 *
 * These concerns belong to infrastructure layers such as an Outbox
 * implementation or event dispatcher.
 */
export class AggregateTracker {
  /**
   * ---
   * Internal set of aggregates that were modified during the current
   * execution scope.
   * ---
   * A Set is used to guarantee that each aggregate instance is tracked only
   * once, even if multiple operations attempt to register it.
   */
  private readonly aggregates = new Set<AggregateRoot<unknown>>();

  /**
   * ---
   * Extracts all domain events from the tracked aggregates.
   *
   * Each aggregate is asked to release its internal domain events via
   * `pullDomainEvents()`. The tracker then clears its internal registry
   * to prevent duplicate event extraction.
   *
   * This method is typically called by a Unit of Work implementation
   * immediately before committing the transaction so that the events can
   * be persisted to an Outbox table.
   *
   * Behavior
   * ---
   * - Aggregates are iterated in insertion order.
   * - Events from all aggregates are flattened into a single array.
   * - The tracker state is reset after collection.
   * ---
   * @returns Array of domain events produced by the tracked aggregates.
   */
  collectEvents(): DomainEvent[] {
    const events: DomainEvent[] = [];

    for (const aggregate of this.aggregates) {
      events.push(...aggregate.pullDomainEvents());
    }

    this.aggregates.clear();

    return events;
  }

  /**
   * ---
   * Registers an aggregate as participating in the current execution scope.
   *
   * Application services should call this method after mutating an aggregate
   * that may have produced domain events. The tracker will later collect
   * those events during the Unit of Work commit phase.
   *
   * Registering the same aggregate multiple times has no effect because
   * the underlying data structure is a Set.
   * ---
   * @template T - Aggregate state type.
   * @param aggregate Aggregate instance that may have produced domain events.
   */
  track<T>(aggregate: AggregateRoot<T>): void {
    this.aggregates.add(aggregate);
  }
}
