/* eslint-disable prettier/prettier */
import type { DomainCreateBatch } from 'server/library/ddd/domain/repository/capabilities/create-batch';
import type { DomainEvent } from 'server/library/ddd/domain/events/domain-event';

import {
  AggregateAlreadyExistsFailure,
  AggregatePersistenceFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { Task } from 'server/library/ddd/primitives';

import type { OutboxDatabase } from './outbox-database';

import {
  type OutboxFailureMap,
  OutboxErrorPolicy,
} from './outbox-error-policy';
import { OutboxSerializer } from './outbox-serializers';

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class OutboxRepository
  implements DomainCreateBatch<typeof OutboxSerializer.insert, OutboxFailureMap> {
  readonly errorPolicy = OutboxErrorPolicy;
  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  private constructor(private readonly persistence: OutboxDatabase) { }

  /** @inheritdoc */
  createBatch(
    events: DomainEvent[],
  ): Task<void, AggregateAlreadyExistsFailure | AggregatePersistenceFailure> {
    return OutboxSerializer.insert
      .serializeList(events)
      .toTask()
      .flatMap(es => this.persistence.createBatch(es))
      .mapError(this.errorPolicy.translate('createBatch'));
  }

  /**
   * ---
   * Factory method for safely creating an `OutboxRepository` instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  static new(persistence: OutboxDatabase) {
    return new OutboxRepository(persistence
    );
  }
}
