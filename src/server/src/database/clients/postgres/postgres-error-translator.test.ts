import {
  AggregateAlreadyExistsFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/errors';

import { PostgresErrorTranslator } from './postgres-error-translator';

describe('PostgresStoryErrorTranslator', () => {
  const translator = new PostgresErrorTranslator();

  describe('.translate()', () => {
    it('should translate unique constraint violation to AggregateAlreadyExistsFailure', () => {
      const error = {
        constraint: 'story_pkey',
        code: '23505',
      };

      const result = translator.translate(error);

      expect(result.translated).toBe(true);

      if (result.translated) {
        expect(result.failure).toBeInstanceOf(AggregateAlreadyExistsFailure);
      }
    });

    it('should translate foreign key violation to AggregateNotFoundFailure', () => {
      const error = {
        constraint: 'story_author_id_fkey',
        code: '23503',
      };

      const result = translator.translate(error);

      expect(result.translated).toBe(true);

      if (result.translated) {
        expect(result.failure).toBeInstanceOf(AggregateNotFoundFailure);
      }
    });

    it('should not translate unknown postgres error codes', () => {
      const error = {
        code: '99999',
      };

      const result = translator.translate(error);

      expect(result.translated).toBe(false);
    });

    it('should not translate plain Error instances', () => {
      const error = new Error('boom');

      const result = translator.translate(error);

      expect(result.translated).toBe(false);
    });

    it('should not translate primitive values', () => {
      expect(translator.translate('error').translated).toBe(false);
      expect(translator.translate(123).translated).toBe(false);
      // eslint-disable-next-line unicorn/no-null
      expect(translator.translate(null as unknown as string).translated).toBe(
        false,
      );
      expect(
        translator.translate(undefined as unknown as string).translated,
      ).toBe(false);
    });

    it('should never throw', () => {
      expect(() => translator.translate({})).not.toThrow();
      expect(() =>
        // eslint-disable-next-line unicorn/no-null
        translator.translate(null as unknown as string),
      ).not.toThrow();
      expect(() =>
        translator.translate(undefined as unknown as string),
      ).not.toThrow();
    });
  });

  describe('.translateOrThrow()', () => {
    it('should throw on unknown postgres error codes', () => {
      const error = {
        code: '99999',
      };

      expect(() => translator.translateOrThrow(error)).toThrow();
    });

    it('should throw on plain Error instances', () => {
      const error = new Error('boom');

      expect(() => translator.translateOrThrow(error)).toThrow();
    });

    it('should not translate primitive values', () => {
      expect(() => translator.translateOrThrow('error')).toThrow();
      expect(() => translator.translateOrThrow(123)).toThrow();
      expect(() =>
        // eslint-disable-next-line unicorn/no-null
        translator.translateOrThrow(null as unknown as string),
      ).toThrow();
      expect(() =>
        translator.translateOrThrow(undefined as unknown as string),
      ).toThrow();
    });

    it('should throw on objects', () => {
      expect(() => translator.translateOrThrow({})).toThrow();
    });
  });
});
