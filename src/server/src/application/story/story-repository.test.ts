import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { StoryRepository } from './story-repository';
import { Story } from './story';

describe('story repository', () => {
  const story = Story.create({
    authorId: UniqueIdentifier.create().value.toString(),
    body: 'some test body',
    title: 'test',
  }).value;

  it('should create an aggregate in @database', async ({ database }) => {
    const repository = new StoryRepository(database);

    const result = await repository.create(story).run();

    expect(result.isSuccess()).toBe(true);
  });
});
