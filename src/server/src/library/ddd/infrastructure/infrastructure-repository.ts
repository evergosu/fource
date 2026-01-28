import type { Database } from 'server/database/database';

import type { InfrastructureErrorTranslator } from './infrastructure-error-translator';

/**
 * ---
 * Base class for infrastructure repository implementations.
 */
export abstract class Repository<Falures> {
  /**
   * ---
   * Constructs a new `Repository` instance.
   * ---
   * @param database - A possible database client.
   * @param errorTranslator - Contract for infrastructure error translators.
   */
  constructor(
    protected readonly database: Database,
    protected readonly errorTranslator: InfrastructureErrorTranslator<Falures>,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
