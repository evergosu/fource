import type { Repository } from 'server/library/ddd/primitives';
import type { TestContext } from 'vitest';

import { PostgresErrorTranslator } from 'server/database/clients/postgres/postgres-error-translator';

export function connectRepository<T extends Repository<unknown>>(
  repository: new (
    ...parameters: ConstructorParameters<typeof Repository>
  ) => T,
  context: unknown,
): T {
  return new repository(
    (context as TestContext).database,
    new PostgresErrorTranslator(),
  );
}
