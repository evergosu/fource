import {
  MaximumLengthExceededFailure,
  MinimumLengthNotMetFailure,
  NullOrUndefinedFailure,
  StringFailure,
} from 'server/library/ddd/errors';

import { StoryBody } from './story-body';

describe('story body', () => {
  const validBody = 'Valid test body content.';

  describe('.create()', () => {
    it('should create a valid story body', () => {
      const result = StoryBody.create(validBody);

      expect(result.isSuccess).toBe(true);
      expect(result.value.body).toBe(validBody);
    });

    it('should fail with null value', () => {
      const result = StoryBody.create(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(NullOrUndefinedFailure);
    });

    it('should fail with not string', () => {
      const result = StoryBody.create({} as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(StringFailure);
    });

    it('should fail with empty string', () => {
      const result = StoryBody.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(MinimumLengthNotMetFailure);
    });

    it('should fail with overly long body', () => {
      const result = StoryBody.create('x'.repeat(1001));
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(MaximumLengthExceededFailure);
    });
  });

  describe('.equals()', () => {
    it('should be equal if values are equal', () => {
      const a = StoryBody.create(validBody).value;

      const b = StoryBody.create(validBody).value;

      expect(a.equals(b)).toBe(true);
    });

    it('should not be equal if values differ', () => {
      const a = StoryBody.create(validBody).value;

      const b = StoryBody.create(validBody + 'foo').value;

      expect(a.equals(b)).toBe(false);
    });
  });
});
