import type { DatabaseTransaction } from 'server/infrastructure/database/database';

import { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { OutboxRepository } from './outbox-repository';

describe('outbox repository', () => {
  const event = {
    aggregateId: UniqueIdentifier.create().value,
    id: UniqueIdentifier.create().value,
    occurredAt: new Date(),
    processed: undefined,
    eventType: 'foo',
    payload: 'bar',
    type: 'foo',
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const createEnvironment = (transaction: DatabaseTransaction) => ({
    provider: new TransactionalDatabaseProvider(transaction),
  });

  describe('.createBatch()', () => {
    it('should create a new event in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = OutboxRepository.new(createEnvironment(transaction));

        const result = await repository.createBatch([{ ...event, id: UniqueIdentifier.create().value }]).run();

        expect(result.isSuccess()).toBe(true);
      });
    });

    it('should fail when the event already exists in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = OutboxRepository.new(createEnvironment(transaction));

        const resultFirst = await repository.createBatch([event]).run();

        expect(resultFirst.isSuccess()).toBe(true);

        const resultSecond = await repository.createBatch([event]).run();

        expect(resultSecond.isFailure()).toBe(true);
        expect(resultSecond.error._tag).toBe('AggregateAlreadyExistsFailure');
      });
    });
  });
});
