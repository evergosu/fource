import type { UniqueIdentifier } from './identifiers/unique-identifier';

import { type DomainEvent } from './events/domain-event';
import { Entity } from './entity';

/**
 * ---
 * Abstract base class for aggregate roots in a DDD system.
 * ---
 * @template T - The type of the aggregate's properties.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  protected readonly _version: number;
  /**
   * ---
   * Constructs a new `AggregateRoot` instance.
   * ---
   * @param properties - The entity's domain properties.
   * @param id - An optional pre-defined unique identifier. If not provided, a new one will be generated.
   * @param version - Incremental number, stored to control optimistic locking for concurrent modifications.
   */
  constructor(properties: T, id?: UniqueIdentifier, version = 0) {
    super(properties, id, false);
    this._domainEvents = [];
    this._version = version;

    Object.freeze(this);
  }

  /**
   * ---
   * The internal collection of domain events associated with this aggregate.
   */
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * ---
   * Adds a domain event to the internal buffer.
   * ---
   * @param event Domain event emitted by this aggregate.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * ---
   * Returns and clears buffered domain events.
   * ---
   * Must only be called inside a transaction boundary.
   * ---
   * @returns Copy of buffered events.
   */
  public pullDomainEvents(): DomainEvent[] {
    const copy = this.domainEvents;

    this.clearDomainEvents();

    return copy;
  }

  /**
   * ---
   * Shallow copy of associated aggregate domain events.
   * ---
   * @returns shallow copy of current aggregate domain events.
   */
  private get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * ---
   * Clears all domain events.
   */
  private clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  /**
   * ---
   * Retrieves a numeric version of an aggregate.
   * ---
   * Represents amount of updates to control optimistic locking for concurrent modifications
   */
  public get version(): number {
    return this._version;
  }

  /**
   * ---
   * Creates a new version of this aggregate with updated properties.
   * ---
   * - identity is preserved
   * - domain events are NOT copied
   * ---
   * @param overrides - Partial properties to override.
   */
  protected evolve(overrides: Partial<T>): this {
    const ctor = this.constructor as new (properties: T, id: UniqueIdentifier, version: number) => this;

    return new ctor(
      {
        ...this.properties,
        ...overrides,
      } as T,
      this.id,
      this._version + 1,
    );
  }
}
