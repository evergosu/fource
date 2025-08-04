import {
  MaximumLengthExceededFailure,
  MinimumLengthNotMetFailure,
  NullOrUndefinedFailure,
  StringFailure,
} from 'server/library/ddd/errors';

import { StoryTitle } from './story-title';

describe('story title', () => {
  describe('.create()', () => {
    it('should create a valid story title', () => {
      const result = StoryTitle.create('Test Title');

      expect(result.isSuccess).toBe(true);
      expect(result.value.title).toBe('Test Title');
    });

    it('should fail with null value', () => {
      const result = StoryTitle.create(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should fail with not string', () => {
      const result = StoryTitle.create({} as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail with empty string', () => {
      const result = StoryTitle.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(MinimumLengthNotMetFailure);
    });

    it('should fail with overly long title', () => {
      const result = StoryTitle.create('x'.repeat(121));
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(MaximumLengthExceededFailure);
    });
  });

  describe('.equals()', () => {
    it('should be equal if values are equal', () => {
      const a = StoryTitle.create('Same Title').value;

      const b = StoryTitle.create('Same Title').value;

      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal if values differ', () => {
      const a = StoryTitle.create('A').value;

      const b = StoryTitle.create('B').value;

      expect(a.equals(b)).toBe(false);
    });
  });
});
