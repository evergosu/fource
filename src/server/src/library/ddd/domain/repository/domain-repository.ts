import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';

/**
 * ---
 * Base class for infrastructure repository implementations.
 */
export abstract class DomainRepository<DatabaseRepository> {
  /**
   * ---
   * PostgreSQL-specific error translator.
   */
  protected readonly errorTranslator = new PostgresErrorTranslator();
  /**
   * ---
   * Constructs a new `DomainRepository` instance.
   * ---
   * @param persistence - A persistence repository.
   */
  constructor(
    protected readonly persistence: DatabaseRepository,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
