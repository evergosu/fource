import type { DomainEvent } from './domain-event';
import type { Result } from '../../primitives';

/**
 * ---
 * Constructor contract used by the event registry to reconstruct
 * domain events from persisted outbox records.
 *
 * This abstraction removes generic constraints from `DomainEvent`
 * while preserving strong typing for concrete event implementations.
 *
 * The registry never instantiates events directly — it delegates
 * reconstruction to the static `rehydrate` factory implemented
 * by each event class.
 * ---
 * Responsibilities:
 * - exposes the event `type` identifier
 * - exposes the `rehydrate` factory
 * ---
 * @template E Concrete event type
 */
export interface DomainEventConstructor<E extends DomainEvent = DomainEvent> {
  /**
   * ---
   * Event type identifier stored in the outbox table.
   */
  readonly type: string;

  /**
   * ---
   * Reconstructs a domain event instance from a persisted record.
   * ---
   * @param properties event properties
   * @param properties.aggregateId identifier of the aggregate that emitted the event
   * @param properties.payload serialized event payload
   * @param properties.occurredAt time when the event occurred
   * @param properties.id unique event identifier
   */
  rehydrate(properties: {
    aggregateId: string;
    payload: unknown;
    occurredAt: Date;
    id: string;
  }): Result<E>;
}

/**
 * ---
 * Registry mapping event type identifiers to event constructors.
 * ---
 * Used by outbox processors to reconstruct concrete domain events
 * from persisted records.
 */
export class DomainEventRegistry {
  private readonly registry = new Map<string, DomainEventConstructor>();

  /**
   * ---
   * Registers a domain event constructor.
   * ---
   * @param event Event class constructor.
   */
  register(event: DomainEventConstructor): void {
    this.registry.set(event.type, event);
  }

  /**
   * ---
   * Resolves constructor for a stored event type.
   * ---
   * @param type Event type identifier
   */
  get(type: string): DomainEventConstructor {
    const ctor = this.registry.get(type);

    if (!ctor) {
      throw new Error(`Unknown event type: ${type}`);
    }

    return ctor;
  }
}
