import {
  AggregateAlreadyExistsFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/errors';
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
});
