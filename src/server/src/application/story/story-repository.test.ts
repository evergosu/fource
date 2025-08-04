import { NoStoriesError, Stories } from './story-repository';

describe('should work with @database', () => {
  it('should return the next story', async ({ database }) => {
    const stories = new Stories(database);

    const title = 'the story';

    await stories.create({ title });

    const nextStory = await stories.getNext();

    expect(nextStory.title).toBe(title);
  });

  it('should throw an error when there is no stories', async ({ database }) => {
    const stories = new Stories(database);

    await expect(() => stories.getNext()).rejects.toThrow(NoStoriesError);
  });
});
