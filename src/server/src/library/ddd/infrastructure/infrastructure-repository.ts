import type { Database } from 'server/database/database';

import type { InfrastructureErrorTranslator } from './infrastructure-error-translator';
import type { InfrastructureFailures } from './infrastructure-errors';
import type { DomainFailure } from '../domain/issues/failure';

/**
 * ---
 * Base class for infrastructure repository implementations.
 */
export abstract class Repository {
  /**
   * ---
   * Constructs a new `Repository` instance.
   * ---
   * @param database - A possible database client.
   * @param errorTranslator - Contract for infrastructure error translators.
   */
  constructor(
    protected readonly database: Database,
    protected readonly errorTranslator: InfrastructureErrorTranslator<
      InfrastructureFailures,
      DomainFailure
    >,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
