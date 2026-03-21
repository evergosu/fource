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
      });
    });

    it('should return empty array when story does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository.getById(storyFirst.id).run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toStrictEqual([]);
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

        expect(deletionResult.isSuccess()).toBe(true);
        expect(deletionResult.value).toContain(storyFirst.id);
        expect(allResult.isSuccess()).toBe(true);
        expect(allResult.value).toStrictEqual([]);
      });
    });

    it('should return empty array when a row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository.delete(storyFirst.id).run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toStrictEqual([]);
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

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]).toMatchObject(storyFirst);
        expect(result.value[1]).toMatchObject(storySecond);
      });
    });

    it('should return empty array when no rows exists in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository.getAll().run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toStrictEqual([]);
      });
    });
  });

  describe('.create()', () => {
    it('should create a new row in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const result = await repository.getAll().run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]).toMatchObject(storyFirst);
      });
    });

    it('should fail when the row already exists in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        await repository.create(storyFirst).run();

        const result = await repository.create(storyFirst).run();

        const allResult = await repository.getAll().run();

        expect(result.isFailure()).toBe(true);
        expect(allResult.isFailure()).toBe(true);
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

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]).toMatchObject({
          title: 'Brand new updated title',
        });
      });
    });

    it('should return empty array when row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository
          .update({
            ...storyFirst,
            title: 'Brand new updated title',
          })
          .run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toStrictEqual([]);
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

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]).toMatchObject({
          title: 'Brand new updated title',
        });
      });
    });

    it('should return empty array when row does not exist in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = new StoryDatabase(transaction);

        const result = await repository
          .updateWithLock({
            ...storyFirst,
            title: 'Brand new updated title',
            version: 1,
          })
          .run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toStrictEqual([]);
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

        expect(result.isSuccess()).toBe(true);
        expect(result.value[0]).toMatchObject(storyFirst);
      });
    });
  });
});
