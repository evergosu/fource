import type { DatabaseContext } from 'server/infrastructure/database/clients/client';

import { createPostgresLiteContext } from 'server/infrastructure/database/clients/pglite';
import { type TestContext, beforeEach, beforeAll, afterAll } from 'vitest';
import { Logger } from 'library/tools/logger';

let database: DatabaseContext;

beforeAll(async () => {
  const logger = new Logger({
    style: 'colorful',
    level: 'error',
  });

  database = await createPostgresLiteContext(logger);

  await database.truncateAll();
});

afterAll(async () => {
  await database.close();
});

beforeEach<TestContext>(async context => {
  const tag = '@database';

  if (
    context.task.suite?.name.includes(tag) ||
    context.task.name.includes(tag)
  ) {
    await database.truncateAll();

    context.database = database.getClient();
  }
});
