import type { Task } from 'server/library/ddd/primitives';

import type { TransactionEnvironment } from '../../application/unit-of-work/unit-of-work';
import type { DomainEvent } from './domain-event';

/**
 * ---
 * Contract for handling domain events.
 *
 * Event handlers implement policies, projections,
 * integrations, or secondary domain actions.
 *
 * Multiple handlers may be registered for the same event.
 * ---
 * @template E - event type handled by this handler
 */
export interface EventHandler<E extends DomainEvent> {
  /**
   * ---
   * Handles a domain event.
   * ---
   * @param event - domain event instance
   * @param environment - current transactional environment
   */
  handle(event: E, environment?: TransactionEnvironment): Task<void, unknown>;
}
