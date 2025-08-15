import { NullOrUndefinedFailure } from 'server/library/ddd/errors';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { StoryCreatedAt } from './story-created-at';
import { StoryTitle } from './story-title';
import { StoryBody } from './story-body';
import { Story } from './story';

describe('story', () => {
  it('should create a story successfully with valid input', () => {
    const storyAuthorIdentifier = UniqueIdentifier.create();

    const storyTitle = StoryTitle.create('Test Story');
    const storyBody = StoryBody.create('This is the body of Test Story.');

    const result = Story.create({
      authorIdentifier: storyAuthorIdentifier.value,
      title: storyTitle.value.title,
      body: storyBody.value.body,
    });

    const story = result.value;

    expect(result.isSuccess).toBe(true);
    expect(story.title.title).toBe('Test Story');
    expect(story.body.body).toBe('This is the body of Test Story.');
    expect(story.authorIdentifier.equals(storyAuthorIdentifier.value)).toBe(
      true,
    );
    expect(story.createdAt).toBeInstanceOf(StoryCreatedAt);
    expect(story.expiresAt.getTime()).toBeGreaterThan(
      story.createdAt.toUnixMilliSeconds(),
    );
  });

  it('should fail to create a story with missing title', () => {
    const authorIdentifier = UniqueIdentifier.create().value;

    const result = Story.create({
      title: undefined as unknown as string,
      body: 'Valid body',
      authorIdentifier,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
  });

  it('should fail to create a story with missing body', () => {
    const authorIdentifier = UniqueIdentifier.create().value;

    const result = Story.create({
      body: undefined as unknown as string,
      authorIdentifier,
      title: 'Title',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
  });

  it('should fail to create a story with missing author identifier', () => {
    const result = Story.create({
      authorIdentifier: undefined as unknown as UniqueIdentifier,
      title: 'Valid Title',
      body: 'Valid body',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
  });
});
