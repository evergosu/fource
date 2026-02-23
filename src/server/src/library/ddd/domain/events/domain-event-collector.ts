import type { AggregateRoot } from '../aggregate-root';
import type { DomainEvent } from './domain-event';

/**
 * ---
 * Transaction-scoped domain event collector.
 * ---
 * Responsibilities:
 * - Collect domain events from aggregates
 * - Provide peek access before persistence
 * - Clear events after successful outbox insert
 * ---
 * Lifetime:
 * - Created inside UnitOfWork
 * - Never shared globally
 * - Disposed at transaction end
 */
export class DomainEventCollector {
  private readonly _events: DomainEvent[] = [];

  /**
   * ---
   * Pulls domain events from aggregate and stores them locally.
   * ---
   * @param aggregate Aggregate root.
   */
  public collectFrom(aggregate: AggregateRoot<unknown>): void {
    this._events.push(...aggregate.pullDomainEvents());
  }

  /**
   * ---
   * Returns collected events without clearing them.
   * ---
   * Used before inserting into outbox.
   */
  public peek(): readonly DomainEvent[] {
    return this._events;
  }

  /**
   * ---
   * Clears internal event buffer.
   * ---
   * Must only be called after successful outbox insert.
   */
  public clear(): void {
    this._events.length = 0;
  }
}
