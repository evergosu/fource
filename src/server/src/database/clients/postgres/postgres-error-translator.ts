/* eslint-disable prettier/prettier */
import type {
  InfrastructureErrorTranslator,
  InfrastructureTranslation,
} from 'server/library/ddd/infrastructure/infrastructure-error-translator';

import {
  AggregateAlreadyExistsFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/errors';

/**
 * ---
 * PostgreSQL-specific error translator.
 * ---
 * This translator maps known PostgreSQL constraint violations
 * (identified by SQLSTATE error codes) into domain-level failures.
 *
 * All unrecognized errors are intentionally left untranslated
 * and must be rethrown by the caller.
 * ---
 * PostgreSQL SQLSTATE reference:
 * [https://www.postgresql.org/docs/current/errcodes-appendix.html]
 */
export class PostgresErrorTranslator
  implements
  InfrastructureErrorTranslator {
  /**
   * ---
   * Attempts to translate a PostgreSQL error into a domain failure.
   * ---
   * @param error - The error thrown by the PostgreSQL driver.
   * @returns
   * - `AggregateAlreadyExistsFailure` for unique constraint violations
   * - `AggregateNotFoundFailure` for foreign key violations
   * - `{ translated: false }` for all other errors
   */
  public translate(
    error: unknown,
  ): InfrastructureTranslation<
    AggregateAlreadyExistsFailure | AggregateNotFoundFailure
  > {
    if (!this.isPostgresError(error)) {
      return { translated: false };
    }

    switch (error.code) {
      case '23505': {
        return {
          failure: new AggregateAlreadyExistsFailure(),
          translated: true,
        };
      }

      case '23503': {
        return {
          failure: new AggregateNotFoundFailure(),
          translated: true,
        };
      }

      default: {
        return { translated: false };
      }
    }
  }

  /**
   * ---
   * Attempts to translate a PostgreSQL error into a domain failure.
   * ---
   * @param error - The error thrown by the PostgreSQL driver.
   * @returns
   * - `AggregateAlreadyExistsFailure` for unique constraint violations
   * - `AggregateNotFoundFailure` for foreign key violations
   * - or `rethrows` for all other errors
   */
  public translateOrThrow(error: unknown) {
    const translation = this.translate(error);

    if (translation.translated) {
      return translation.failure;
    }

    throw error;
  }

  /**
   * ---
   * Type guard for PostgreSQL driver errors.
   * ---
   * @param error - Unknown thrown value
   * @returns `true` if the error resembles a PostgreSQL error object
   */
  private isPostgresError(error: unknown): error is { code?: string; } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }
}

