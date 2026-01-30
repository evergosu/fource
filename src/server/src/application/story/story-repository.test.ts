import {
  AggregateAlreadyExistsFailure,
  AggregateConcurrencyFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/errors';
import { GuardNonEmptyArray } from 'server/library/ddd/domain/invariants/array/non-empty-array';
import { UniqueIdentifier, Task } from 'server/library/ddd/primitives';

import { StoryRepository } from './story-repository';
import { Story } from './story';

describe('story repository', () => {
  const storyFirst = {
    authorId: UniqueIdentifier.create().value.toString(),
    title: 'Title number one',
    body: 'Body number one',
  };

  const storySecond = {
    authorId: UniqueIdentifier.create().value.toString(),
    title: 'Title number two',
    body: 'Body number two',
  };

  describe('.getAll()', () => {
    it('should return all stories from @database', async ({ database }) => {
      const repository = new StoryRepository(database);

      const result = await Task.all([
        Story.create(storyFirst)
          .toTask()
          .flatMap(story => repository.create(story)),
        Story.create(storySecond)
          .toTask()
          .flatMap(story => repository.create(story)),
      ])
        .flatMap(() => repository.getAll())
        .run();

      expect(result.isSuccess()).toBe(true);
      expect(result.value).toHaveLength(2);
    });

    it('should fail when no stories exists in @database', async ({
      database,
    }) => {
      const repository = new StoryRepository(database);

      const result = await repository.getAll().run();

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
    });
  });

  describe('.create()', () => {
    it('should create a new story in @database', async ({ database }) => {
      const repository = new StoryRepository(database);

      const result = await Story.create(storyFirst)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(result.isSuccess()).toBe(true);
    });

    it('should fail when the story already exists in @database', async ({
      database,
    }) => {
      const repository = new StoryRepository(database);

      const resultFirst = await Story.create(storyFirst)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(resultFirst.isSuccess()).toBe(true);

      const resultSecond = await Story.create(storyFirst)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(resultSecond.isFailure()).toBe(true);
      expect(resultSecond.error).toBeInstanceOf(AggregateAlreadyExistsFailure);
    });
  });

  describe('.updateWithLock()', () => {
    it('should update an existing story in @database', async ({ database }) => {
      const repository = new StoryRepository(database);

      const story = Story.create(storyFirst);

      await story
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      const first = repository
        .getAll()
        .refine(ss => GuardNonEmptyArray.refine(ss, 'test'))
        .map(ss => ss[0]);

      await first
        .flatMap(s => s.updateTitle('Brand new updated title').toTask())
        .flatMap(s => repository.updateWithLock(s))
        .run();

      const updatedFirst = await first.run();

      expect(updatedFirst.isSuccess()).toBeTruthy();
      expect(updatedFirst.value.title.title).toBe('Brand new updated title');
    });

    it('should fail when story does not exist in @database', async ({
      database,
    }) => {
      const repository = new StoryRepository(database);

      const story = Story.create(storyFirst);

      await story
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      const first = repository
        .getAll()
        .refine(ss => GuardNonEmptyArray.refine(ss, 'test'))
        .map(ss => ss[0]);

      await story
        .toTask()
        .flatMap(story => repository.delete(story.id))
        .run();

      const result = await first
        .flatMap(s => s.updateTitle('Brand new updated title').toTask())
        .flatMap(s => repository.updateWithLock(s))
        .run();

      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
    });

    it('should fail when story is already concurrently updated in @database', async ({
      database,
    }) => {
      const repository = new StoryRepository(database);

      const story = Story.create(storyFirst);

      await story
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      const first = repository
        .getAll()
        .refine(ss => GuardNonEmptyArray.refine(ss, 'test'))
        .map(ss => ss[0]);

      await story
        .toTask()
        .flatMap(story => repository.delete(story.id))
        .run();

      const result = await first
        .flatMap(s => s.updateTitle('Brand new updated title').toTask())
        .flatMap(s => s.updateTitle('Brand new updated title').toTask())
        .flatMap(s => repository.updateWithLock(s))
        .run();

      expect(result.isFailure()).toBeTruthy();
      expect(result.error).toBeInstanceOf(AggregateConcurrencyFailure);
    });
  });
});
