import { AggregateAlreadyExistsFailure } from 'server/library/ddd/domain/repository/repository-errors';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { OutboxRepository } from './outbox-repository';
import { OutboxDatabase } from './outbox-database';

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

  describe('.createBatch()', () => {
    it('should create a new event in @database', async ({ database }) => {
      const repository = new OutboxRepository(new OutboxDatabase(database));

      const result = await repository.createBatch([event]).run();

      expect(result.isSuccess()).toBe(true);
    });

    it('should fail when the event already exists in @database', async ({
      database,
    }) => {
      const repository = new OutboxRepository(new OutboxDatabase(database));

      const resultFirst = await repository.createBatch([event]).run();

      expect(resultFirst.isSuccess()).toBe(true);

      const resultSecond = await repository.createBatch([event]).run();

      expect(resultSecond.isFailure()).toBe(true);
      expect(resultSecond.error._tag).toBe(AggregateAlreadyExistsFailure);
    });
  });
});
