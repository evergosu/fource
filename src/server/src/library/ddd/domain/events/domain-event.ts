import type { Result } from '../../primitives';

import { UniqueIdentifier } from '../identifiers/unique-identifier';
import { Exception } from '../issues/exception';

/**
 * ---
 * Base class for all domain events.
 *
 * Domain events represent immutable facts that occurred within the domain
 * model. They are produced by aggregates and later dispatched to policies,
 * projections or integration handlers.
 * ---
 * The base class provides:
 * - A globally unique identifier for the event
 * - The aggregate identifier that emitted the event
 * - The event occurrence timestamp
 * - A static rehydration contract used by the infrastructure layer
 * ---
 * Concrete domain events must extend this class and implement the static
 * `rehydrate` method so that infrastructure components (such as the
 * Outbox processor) can reconstruct event instances from persisted data.
 * ---
 * ```ts
 * export class UserRegisteredEvent extends DomainEvent<UserRegisteredPayload> {
 *   public static readonly type = 'UserRegisteredEvent';
 *
 *   static rehydrate(properties: {aggregateId: UniqueIdentifier, payload: unknown, occurredAt: Date, id: UniqueIdentifier}): UserRegisteredEvent {
 *     return new UserRegisteredEvent(aggregateId, payload as UserRegisteredPayload, occurredAt, id);
 *   }
 * }
 * ```
 * ---
 * @template Payload Type of payload carried by the event.
 */
export abstract class DomainEvent<Payload = unknown> {
  /**
   * ---
   * Constructs a new domain event.
   * ---
   * @param aggregateId - Identifier of the aggregate that produced the event.
   * @param payload     - Event payload containing event-specific data.
   * @param type        - Event type identifier. Concrete events must override the static `type` property.
   * @param occurredAt  - Timestamp when the event occurred.
   * @param id          - Globally unique identifier of the event instance.
   *                      Each emitted event receives a unique identifier to ensure that
   *                      event processing systems can safely detect duplicates and maintain
   *                      idempotent event handling.
   */
  protected constructor(
    public readonly aggregateId: UniqueIdentifier,
    public readonly payload: Payload,
    public readonly type: string,
    public readonly occurredAt: Date = new Date(),
    public readonly id: UniqueIdentifier = UniqueIdentifier.create().value,
    // eslint-disable-next-line prettier/prettier
  ) { }

  /**
   * ---
   * Rehydrates event instance from serialized storage representation.
   *
   * Infrastructure layers such as the Outbox processor use this method
   * to reconstruct domain events from persisted rows.
   *
   * Concrete event classes must implement this method.
   * ---
   * @param properties event properties
   * @param properties.aggregateId - Aggregate identifier.
   * @param properties.payload     - Serialized payload.
   * @param properties.occurredAt  - Timestamp when event originally occurred.
   * @param properties.type        - Event type identifier. Concrete events must override the static `type` property.
   * @param properties.id          - Globally unique identifier of the event instance.
   */
  public static rehydrate(properties: {
    aggregateId: string;
    occurredAt: Date;
    payload: never;
    type: string;
    id: string;
  }): Result<DomainEvent> {
    console.log('', properties);

    throw new EventRehydrationException(
      `DomainEvent.rehydrate must be implemented by subclasses`,
    );
  }
}

// eslint-disable-next-line prettier/prettier
class EventRehydrationException extends Exception { }
