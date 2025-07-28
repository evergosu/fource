import type { UniqueIdentifier } from './unique-identifier';
import type { AggregateRoot } from './aggregate-root';

/**
 * A base interface for `domain events`.
 *
 * Domain events are used to capture meaningful events that occur within the domain layer.
 */
export interface DomainEvent {
  /**
   * The timestamp at which the domain event occurred.
   */
  readonly occurredAt: Date;
  /**
   * The `unique identifier` of an aggregate dispatched the event.
   */
  readonly aggregateId: UniqueIdentifier;
}

type Handler<T extends DomainEvent> = (event: T) => void;

/**
 * DomainEvents manages the registration and dispatching of domain events.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DomainEvents {
  /**
   * Internal map to track subscribed handlers to dispatch them a single event.
   */
  private static subscribers = new Map<string, Handler<DomainEvent>[]>();

  /**
   * Internal map to track aggregates that have domain events pending dispatch.
   */
  private static aggregatesMarkedForDispatch = new Set<
    AggregateRoot<unknown>
  >();

  /**
   * Registers a handler for a specific domain event type.
   * @param event - The name of the domain event.
   * @param handler - The callback function to be called when the event is dispatched.
   * @returns function to unsubsribe given handler.
   */
  public static subscribe<T extends DomainEvent>(
    event: new (aggregateId: UniqueIdentifier) => T,
    handler: Handler<T>,
  ): () => void {
    const eventName = event.name;

    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }

    // Safe cast: we only call this handler with events of this exact class.
    this.subscribers.get(eventName)?.push(handler as Handler<DomainEvent>);

    const unsubsribe = () => {
      this.subscribers.set(
        eventName,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.subscribers.get(eventName)!.filter(h => h !== handler),
      );
    };

    return unsubsribe;
  }

  /**
   * Marks an aggregate for domain event dispatch.
   * @param aggregate - The aggregate to mark.
   */
  public static markAggregateForDispatch(
    aggregate: AggregateRoot<unknown>,
  ): void {
    if (!DomainEvents.aggregatesMarkedForDispatch.has(aggregate)) {
      DomainEvents.aggregatesMarkedForDispatch.add(aggregate);
    }
  }

  /**
   * Dispatches domain events for an aggregate and clears them.
   * @param aggregate - The aggregate whose events should be dispatched.
   */
  public static dispatchEventsForAggregate(
    aggregate: AggregateRoot<unknown>,
  ): void {
    for (const event of aggregate.domainEvents) {
      this.dispatch(event);
    }

    aggregate.clearDomainEvents();
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    DomainEvents.aggregatesMarkedForDispatch.delete(aggregate);
  }

  /**
   * Dispatches all domain events for aggregates that were marked for dispatch.
   */
  public static dispatchAggregateEvents(): void {
    for (const aggregate of DomainEvents.aggregatesMarkedForDispatch) {
      this.dispatchEventsForAggregate(aggregate);
    }

    DomainEvents.aggregatesMarkedForDispatch.clear();
  }

  /**
   * Dispatches a single domain event to all registered handlers.
   * @param event - The domain event to dispatch.
   */
  private static dispatch(event: DomainEvent): void {
    const eventName = event.constructor.name;

    const handlers = this.subscribers.get(eventName) ?? [];

    for (const handler of handlers) {
      handler(event);
    }
  }

  /**
   * Clears all event handlers (subscribers).
   */
  public static clearHandlers(): void {
    this.subscribers.clear();
  }

  /**
   * Clears all aggregates marked for dispatch.
   */
  public static clearMarkedAggregates(): void {
    this.aggregatesMarkedForDispatch.clear();
  }

  /**
   * Clears both handlers and marked aggregates (used in tests).
   */
  public static clear(): void {
    this.clearHandlers();
    this.clearMarkedAggregates();
  }
}
