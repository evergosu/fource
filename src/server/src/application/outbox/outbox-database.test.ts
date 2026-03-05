import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { OutboxDatabase } from './outbox-database';

describe('outbox database', () => {
  const event = {
    aggregateId: UniqueIdentifier.create().value.toString(),
    id: UniqueIdentifier.create().value.toString(),
    occurredAt: new Date(),
    processed: undefined,
    payload: 'bar',
    type: 'foo',
  };

  describe('.createBatch()', () => {
    it('should create a new rows in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new OutboxDatabase(transaction);

        const result = await repository.createBatch([event]).run();

        expect(result.isSuccess()).toBeTruthy();

        transaction.rollback();
      });
    });

    it('should fail when the rows already exists in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = new OutboxDatabase(transaction);

        await repository.createBatch([event]).run();

        const result = await repository.createBatch([event]).run();

        expect(result.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });
  });
});
