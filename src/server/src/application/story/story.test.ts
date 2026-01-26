import { NullOrUndefinedFailure } from 'server/library/ddd/errors';

import { Story } from './story';

describe('story', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-09T12:34:56'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('.update()', () => {
    it('should rehydrate a story successfully with valid input', () => {
      const storyDto = {
        createdAt: new Date('2025-08-12T10:15:30.000Z'),
        expiresAt: new Date('2025-08-10T10:15:30.000Z'),
        body: 'This is the body of Test Story.',
        id: '0000-00000-0000-999999',
        authorId: 'John Doe',
        title: 'Test Story',
        version: 0,
      };

      const result = Story.rehydrate(storyDto);

      const story = result.value;

      expect(result.isSuccess()).toBe(true);
      expect(story.title.title).toBe('Test Story');
      expect(story.body.body).toBe('This is the body of Test Story.');
      expect(story.authorId.authorId).toBe('John Doe');
    });

    it('should translate errors from invalid input', () => {
      const storyDto = {
        createdAt: new Date('2025-08-12T10:15:30.000Z'),
        expiresAt: new Date('2025-08-10T10:15:30.000Z'),
        body: 'This is the body of Test Story.',
        title: undefined as unknown as string,
        id: '0000-00000-0000-999999',
        authorId: 'John Doe',
        version: 0,
      };

      const result = Story.rehydrate(storyDto);

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });
  });

  describe('.create()', () => {
    it('should create a story successfully with valid input', () => {
      const result = Story.create({
        body: 'This is the body of Test Story.',
        authorId: 'John Doe',
        title: 'Test Story',
      });

      const story = result.value;

      expect(result.isSuccess()).toBe(true);
      expect(story.title.title).toBe('Test Story');
      expect(story.body.body).toBe('This is the body of Test Story.');
      expect(story.authorId.authorId).toBe('John Doe');
    });

    it('should fail to create a story with missing title', () => {
      const result = Story.create({
        title: undefined as unknown as string,
        authorId: 'John Doe',
        body: 'Valid body',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should fail to create a story with missing body', () => {
      const result = Story.create({
        body: undefined as unknown as string,
        authorId: 'John Doe',
        title: 'Title',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should fail to create a story with missing author identifier', () => {
      const result = Story.create({
        authorId: undefined as unknown as string,
        title: 'Valid Title',
        body: 'Valid body',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });
  });
});
