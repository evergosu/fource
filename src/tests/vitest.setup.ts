import '@testing-library/jest-dom/vitest';

import type { DatabaseContext } from 'server/database/clients/client';

import {
  type ServerContext as ApplicationServerContext,
  startServer as startApplicationServer,
} from 'server/server/express';
import {
  type ServerContext as NextServerContext,
  startServer as startNextServer,
} from 'client/server/express';
import {
  type RunnerTaskBase,
  type TestContext,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { createPostgresLiteContext } from 'server/database/clients/pglite';
import { Logger } from 'library/tools/logger';

vi.mock('next/font/google', () => ({
  Inter: () => ({
    variable: '--font-inter',
    className: 'font-inter',
  }),
}));

let database: DatabaseContext;
let server: ApplicationServerContext;
let nextServer: NextServerContext;

beforeAll(async () => {
  const logger = new Logger({
    style: 'colorful',
    level: 'error',
  });

  database = await createPostgresLiteContext(logger);

  server = startApplicationServer(database, logger, 'random');

  await database.truncateAll();

  try {
    nextServer = await startNextServer(
      logger,
      new URL(`http://localhost:${server.getPort()}`),
      'random',
    );
  } catch (error: unknown) {
    logger.error('Error during NextJS start.', error);
  }

  const url = `http://localhost:${nextServer.getPort().toString()}`;

  process.env.NEXT_PUBLIC_ORIGIN = url;
  process.env.NEXT_PUBLIC_BASE_URL = url;
});

afterAll(async () => {
  await nextServer.shutdown('tests done');
  await server.shutdown('tests done');
});

beforeEach<TestContext>(async context => {
  const tag = '@database';

  const hasTag = (task: RunnerTaskBase): boolean => {
    if (task.name.includes(tag)) return true;

    let current: RunnerTaskBase = context.task;

    while (hasSuite(current)) {
      if (current.suite.name.includes(tag)) return true;

      current = current.suite;
    }

    return false;
  };

  // Truncate all database tables and provide context,
  // if any entity in test has tag in the name and
  // task is the first step of current scenario.
  if (hasTag(context.task) && isFirstStepOfScenario(context.task)) {
    await database.truncateAll();

    context.database = database.getClient();
  }
});

function isFirstStepOfScenario(task: RunnerTaskBase) {
  return hasSuite(task) ? task.suite.tasks.at(0)?.name === task.name : false;
}

function hasSuite(task: unknown): task is { suite: RunnerTaskBase } {
  return !!task && typeof task === 'object' && 'suite' in task;
}
