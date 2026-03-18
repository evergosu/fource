/* eslint-disable prettier/prettier */
import type { Database } from 'server/infrastructure/database/database';

import {
  type TransactionEnvironment,
  UnitOfWorkFailure,
  type UnitOfWork,
} from 'server/library/ddd/application/unit-of-work/unit-of-work';
import { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import { Task } from 'server/library/ddd/primitives';

import { AggregateTracker } from './aggregate-tracker';
import { OutboxRepository } from 'server/module/outbox/infrastructure/repository/outbox-repository';

/** @inheritdoc */
export class DrizzleUnitOfWork implements UnitOfWork {
  /**
   * ---
   * Creates a new Unit of Work bound to a database instance.
   * ---
   * @param database Database connection capable of executing transactions.
   */
  constructor(private readonly database: Database) { }

  /** @inheritdoc */
  execute<Output, Failure>(
    work: (environment: TransactionEnvironment) => Task<Output, Failure>,
  ): Task<Output, UnitOfWorkFailure> {
    return Task.fromPromise(() =>
      this.database.transaction(async tx => {
        const tracker = new AggregateTracker();

        const provider = new TransactionalDatabaseProvider(tx);

        const result = await work({ provider, tracker }).run();

        if (result.isFailure()) {
          tx.rollback();
        }

        const events = tracker.collectEvents();

        if (events.length > 0) {
          const outbox = OutboxRepository.new({ provider });

          const result = await outbox.createBatch(events).run();

          if (result.isFailure()) {
            tx.rollback();
          }
        }

        return result.value;
      }),
    ).matchFailure({
      _: UnitOfWorkFailure,
    });
  }
}
