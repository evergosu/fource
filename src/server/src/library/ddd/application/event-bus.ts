import { type DomainEvent, Task } from 'server/library/ddd/primitives';

import type { EventHandler } from '../domain/events/domain-event-handler';
import type { TransactionEnvironment } from './unit-of-work/unit-of-work';
import type { EventBus } from '../domain/events/domain-event-bus';

/**
 * ---
 * In-memory implementation of EventBus.
 * This implementation is intended for application layer orchestration.
 * ---
 * Responsibilities:
 * - registers event handlers
 * - dispatches events to all handlers
 * - executes handlers sequentially
 */
export class InMemoryEventBus implements EventBus {
  /**
   * ---
   * Internal handler registry.
   * ---
   * Key: event constructor name
   * Value: list of handlers
   */
  private readonly handlers = new Map<string, EventHandler<DomainEvent>[]>();

  /**
   * ---
   * Registers handler for event type.
   * Multiple handlers may be registered for the same event.
   * ---
   * @param eventType - event type
   * @param handler - event handler instance
   */
  register<E extends DomainEvent>(eventType: string, handler: EventHandler<E>): void {
    const handlers = this.handlers.get(eventType) ?? [];

    handlers.push(handler);

    this.handlers.set(eventType, handlers);
  }

  /**
   * ---
   * Publishes domain event to all registered handlers.
   * ---
   * If no handlers are registered the event is ignored.
   * Handlers are executed sequentially.
   * ---
   * @param event - event instance
   * @param environment - current transaction environment
   */
  publish(event: DomainEvent, environment?: TransactionEnvironment): Task<void, unknown> {
    const handlers = this.handlers.get(event.constructor.name) ?? [];

    if (handlers.length === 0) {
      return Task.ok();
    }

    return Task.traverseDiscard(handlers, handler => handler.handle(event, environment));
  }
}
