import type { UniqueIdentifier } from '../identifiers/unique-identifier';

/**
 * ---
 * Represents an immutable domain event emitted by an aggregate.
 * ---
 * Domain events are:
 * - Created inside aggregates
 * - Collected inside a transaction
 * - Persisted into the Outbox table
 * - Later dispatched asynchronously
 * ---
 * Invariants:
 * - id must be globally unique
 * - occurredAt must represent event creation time
 * - payload must be serializable
 */
export interface DomainEvent {
  /**
   * ---
   * Globally `unique identifier` for the event.
   */
  readonly id: UniqueIdentifier;
  /**
   * ---
   * The timestamp at which the domain event occurred.
   */
  readonly occurredAt: Date;
  /**
   * ---
   * The usefull payload carried by the domain event.
   */
  readonly payload: unknown;
  /**
   * ---
   * The concrete type of the domain event.
   */
  readonly type: string;
  /**
   * ---
   * The `unique identifier` of an aggregate dispatched the event.
   */
  readonly aggregateId: UniqueIdentifier;
}
