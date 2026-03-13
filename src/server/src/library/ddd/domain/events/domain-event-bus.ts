import type { Task } from 'server/library/ddd/primitives';

import type { TransactionEnvironment } from '../../application/unit-of-work/unit-of-work';
import type { EventHandler } from './domain-event-handler';
import type { DomainEvent } from './domain-event';

/**
 * ---
 * Event bus abstraction.
 *
 * Responsible for delivering domain events
 * to all registered handlers.
 */
export interface EventBus {
  /**
   * ---
   * Registers handler for event type.
   */
  register<E extends DomainEvent>(
    eventType: string,
    handler: EventHandler<E>,
  ): void;

  /**
   * ---
   * Publishes domain event to all handlers.
   */
  publish(
    event: DomainEvent,
    environment?: TransactionEnvironment,
  ): Task<void, unknown>;
}
