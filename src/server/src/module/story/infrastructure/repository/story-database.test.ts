import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { StoryDatabase } from './story-database';

describe('story database', () => {
  const storyFirst = {
    authorId: UniqueIdentifier.create().value.toString(),
    id: UniqueIdentifier.create().value.toString(),
    title: 'Title number one',
    body: 'Body number one',
    isBanned: false,
    version: 0,
  };

  const storySecond = {
    authorId: UniqueIdentifier.create().value.toString(),
    id: UniqueIdentifier.create().value.toString(),
    body: 'Body number two and too long',
    title: 'Title number two',
    isBanned: false,
    version: 0,
  };

  describe('.getById()', () => {
    it('should return a row by its id from @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]?.id).toBe(storyFirst.id);

        transaction.rollback();
      });
    });

    it('should fail when story does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isFailure()).toBe(true);

        transaction.rollback();
      });
    });
  });

  describe('.delete()', () => {
    it('should delete an existing row in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const deletionResult = await repository.delete(storyFirst.id).run();

        const allResult = await repository.getAll().run();

        expect(deletionResult.isSuccess()).toBeTruthy();
        expect(deletionResult.value).toContain([storyFirst.id]);
        expect(allResult.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });

    it('should fail when a row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const deletionResult = await repository.delete(storyFirst.id).run();

        expect(deletionResult.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });
  });

  describe('.getAll()', () => {
    it('should return all rows from @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();
        await repository.create(storySecond).run();

        const result = await repository.getAll().run();

        expect(result.isSuccess()).toBeTruthy();
        expect(result.value[0]).toContainEqual(storyFirst);
        expect(result.value[1]).toContainEqual(storySecond);

        transaction.rollback();
      });
    });

    it('should fail when no rows exists in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository.getAll().run();

        expect(result.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });
  });

  describe('.create()', () => {
    it('should create a new row in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const result = await repository.getAll().run();

        expect(result.isSuccess()).toBeTruthy();
        expect(result.value[0]).toContainEqual(storyFirst);

        transaction.rollback();
      });
    });

    it('should fail when the row already exists in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const result = await repository.create(storyFirst).run();

        const allResult = await repository.getAll().run();

        expect(result.isFailure()).toBeTruthy();
        expect(allResult.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });
  });

  describe('.update()', () => {
    it('should update an existing row in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        await repository
          .update({
            ...storyFirst,
            title: 'Brand new updated title',
          })
          .run();

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isSuccess()).toBeTruthy();
        expect(result.value[0]).toContainEqual({
          title: 'Brand new updated title',
        });

        transaction.rollback();
      });
    });

    it('should fail when row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository
          .update({
            ...storyFirst,
            title: 'Brand new updated title',
          })
          .run();

        expect(result.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });
  });

  describe('.updateWithLock()', () => {
    it('should update an existing row in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        await repository
          .updateWithLock({
            ...storyFirst,
            title: 'Brand new updated title',
            version: 1,
          })
          .run();

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isSuccess()).toBeTruthy();
        expect(result.value[0]).toContainEqual({
          title: 'Brand new updated title',
        });

        transaction.rollback();
      });
    });

    it('should fail when row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository
          .updateWithLock({
            ...storyFirst,
            title: 'Brand new updated title',
            version: 1,
          })
          .run();

        expect(result.isFailure()).toBeTruthy();

        transaction.rollback();
      });
    });

    it('should fail when row is already concurrently updated in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        await repository
          .updateWithLock({
            ...storyFirst,
            title: 'Brand new updated title',
            version: 2,
          })
          .run();

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isSuccess()).toBeTruthy();
        expect(result.value[0]).toContainEqual(storyFirst);

        transaction.rollback();
      });
    });
  });
});
