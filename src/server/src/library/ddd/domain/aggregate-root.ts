import type { UniqueIdentifier } from './identifiers/unique-identifier';

import { type DomainEvent, DomainEvents } from './domain-events';
import { Entity } from './entity';

/**
 * Abstract base class for aggregate roots in a DDD system.
 * @template T - The type of the aggregate's properties.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  /**
   * Constructs a new `AggregateRoot` instance.
   * @param properties - The entity's domain properties.
   * @param id - An optional pre-defined unique identifier. If not provided, a new one will be generated.
   */
  constructor(properties: T, id?: UniqueIdentifier) {
    super(properties, id, false);
    this._domainEvents = [];

    Object.freeze(this);
  }
  /**
   * The internal collection of domain events associated with this aggregate.
   */
  private _domainEvents: DomainEvent[] = [];

  /**
   * Shallow copy of associated aggregate domain events.
   * @returns shallow copy of current aggregate domain events.
   */
  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to the internal list and marks this aggregate for dispatch.
   * @param event - The domain event to add.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);

    DomainEvents.markAggregateForDispatch(this);
  }

  /**
   * Clears all domain events.
   */
  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}
