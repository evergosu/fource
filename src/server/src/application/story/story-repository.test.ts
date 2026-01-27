import { AggregateAlreadyExistsFailure } from 'server/library/ddd/errors';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { StoryRepository } from './story-repository';
import { Story } from './story';

describe('story repository', () => {
  const story = {
    authorId: UniqueIdentifier.create().value.toString(),
    title: 'Title number one',
    body: 'Body number one',
  };

  describe('.create()', () => {
    it('should create a new story in @database', async ({ database }) => {
      const repository = new StoryRepository(database);

      const result = await Story.create(story)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(result.isSuccess()).toBe(true);
    });

    it('should fail when the story already exists in @database', async ({
      database,
    }) => {
      const repository = new StoryRepository(database);

      const resultFirst = await Story.create(story)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(resultFirst.isSuccess()).toBe(true);

      const resultSecond = await Story.create(story)
        .toTask()
        .flatMap(story => repository.create(story))
        .run();

      expect(resultSecond.isFailure()).toBe(true);
      expect(resultSecond.error).toBeInstanceOf(AggregateAlreadyExistsFailure);
    });
  });
});
