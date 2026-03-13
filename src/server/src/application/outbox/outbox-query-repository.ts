/* eslint-disable prettier/prettier */
import type { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import type { OutboxSelectSchema } from 'server/database/schema/outbox';

import {
  AggregatePersistenceFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { Task } from 'server/library/ddd/primitives';

import {
  OutboxErrorPolicy,
} from './outbox-error-policy';
import { OutboxDatabase } from './outbox-database';

interface OutboxRepositoryEnvironment {
  provider: TransactionalDatabaseProvider;
}

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class OutboxQueryRepository {
  readonly errorPolicy = OutboxErrorPolicy;
  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  private constructor(private readonly persistence: OutboxDatabase) { }


  /**
   * ---
   * Retrieves all unprocessed outbox events.
   *
   * Used by the outbox dispatcher to load events that still
   * need to be delivered to event handlers.
   * ---
   * @param limit Maximum batch size.
   * @returns Task resolving to unprocessed outbox records.
   */
  public getUnprocessed(limit: number): Task<
    OutboxSelectSchema[],
    AggregatePersistenceFailure | AggregateNotFoundFailure
  > {
    return this.persistence
      .getUnprocessedBatch(limit)
      .mapError(this.errorPolicy.translate('getUnprocessedBatch'));
  }


  /**
   * ---
   * Factory method for safely creating an `OutboxRepository` instance.
   * ---
   * @param environment - environment in which instance should be created.
   */
  static new(environment: OutboxRepositoryEnvironment) {
    return new OutboxQueryRepository(environment.provider.get(OutboxDatabase));
  }
}
