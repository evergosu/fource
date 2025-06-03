import type { DatabaseContext } from 'server/database/clients/client';

import { type TestContext, beforeEach, beforeAll, afterAll } from 'vitest';
import { createPostgresLiteContext } from 'server/database/clients/pglite';
import { Logger } from 'server/lib/logger';

let database: DatabaseContext;

beforeAll(async () => {
  const logger = new Logger({
    style: 'colorful',
    level: 'success',
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
