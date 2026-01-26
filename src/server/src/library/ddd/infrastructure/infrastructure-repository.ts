import type { Database } from 'server/database/database';

import type { InfrastructureErrorTranslator } from './infrastructure-error-translator';

/**
 * ---
 * Base class for infrastructure repository implementations.
 */
export abstract class InfrastructureRepository {
  /**
   * ---
   * Constructs a new `InfrastructureRepository` instance.
   * ---
   * @param database - A possible database client.
   * @param errorTranslator - Contract for infrastructure error translators.
   */
  constructor(
    protected readonly database: Database,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly errorTranslator: InfrastructureErrorTranslator<any>,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
