import { NullOrUndefinedFailure } from 'server/library/ddd/errors';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

import { Story } from './story';

describe('story', () => {
  it('should create a story successfully with valid input', () => {
    const authorIdentifier = UniqueIdentifier.create().value;

    const result = Story.create({
      body: 'This is the body of Test Story.',
      title: 'Test Story',
      authorIdentifier,
    });

    const story = result.value;

    expect(result.isSuccess).toBe(true);
    expect(story.title).toBe('Test Story');
    expect(story.body).toBe('This is the body of Test Story.');
    expect(story.authorIdentifier.equals(authorIdentifier)).toBe(true);
    expect(story.createdAt).toBeInstanceOf(Date);
    expect(story.expiresAt.getTime()).toBeGreaterThan(
      story.createdAt.getTime(),
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
