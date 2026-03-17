import type { DatabaseContext } from 'server/infrastructure/database/clients/client';
import type { Logger } from 'library/tools/logger';
import type { Server } from 'node:http';

import { createBanRouter } from 'server/module/ban-vote/interface/http/ban-vote-router';
import { createStoryRouter } from 'server/module/story/interface/http/story-router';
import { getEnvironment } from 'server/library/environment';
import { commandBus } from 'server/application/command-bus';
import { queryBus } from 'server/application/query-bus';
import express from 'express';

import { rateLimitByEnvironment } from './middlewares/rate-limit';
import { createErrorHandler } from './middlewares/error-handler';
import { helmetByEnvironment } from './middlewares/helmet';
import { morganByEnvironment } from './middlewares/morgan';
import { allowCorsFor } from './middlewares/cors';

export interface ServerContext {
  shutdown: (reason: string) => ReturnType<typeof shutdown>;
  getPort: () => ReturnType<typeof getPort>;
}

/**
 * Starts NodeJS server with provided settings.
 * @param database - database context with DSL API of current database.
 * @param logger - custom logger to print system messages.
 * @param port - port to run the application, randomly discovered otherwise.
 * @returns server context with DSL API.
 */
export function startServer(
  database: DatabaseContext,
  logger: Logger,
  port: 'environment' | 'random' = 'environment',
): ServerContext {
  const environment = getEnvironment();

  const server = express()
    .set('trust proxy', 1)
    .use(
      allowCorsFor([
        environment.server.url.origin,
        environment.client.url.origin,
      ]),
    )
    .use(...helmetByEnvironment)
    .use(...rateLimitByEnvironment)
    .use(...morganByEnvironment)
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(
      '/api/story',
      createStoryRouter(commandBus, queryBus),
      createBanRouter(commandBus),
    )
    .use(createErrorHandler(logger))
    .listen(port === 'random' ? 0 : environment.server.url.port, () => {
      logger.info(`Server running at http://localhost:${getPort(server)}`);

      sendReady();
    });

  registerShutdownOnSignals(['SIGINT', 'SIGTERM'], server, database, logger);

  return {
    shutdown: async (reason: string) => {
      await shutdown(reason, server, database, logger);
    },
    getPort: () => getPort(server),
  };
}

/**
 * Send `ready` signal to underlying process,
 * usually it is a docker container or
 * some other sort of virtualisation.
 */
function sendReady() {
  if (process.env.NODE_ENV !== 'test' && 'send' in process) {
    process.send('ready');
  }
}

/**
 * The public DSL method allowing to gracefully
 * turn off current server instance.
 * @param reason - The reason to stop.
 * @param server - The current instance of the server.
 * @param database The database connection to gracefully drop.
 * @param logger - The custom logger to print system messages.
 */
async function shutdown(
  reason: string,
  server: Server,
  database: DatabaseContext,
  logger: Logger,
): Promise<void> {
  logger.info(`Gracefully shutting down, because ${reason}.`);

  const timeout = setTimeout(() => {
    throw new Error('Forced shutdown: timeout exceeded.');
  }, 10_000);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    logger.success('The server has been stopped gracefully.');

    await database.close();

    logger.success('Graceful shutdown succeeded.');
  } catch (error) {
    throw new Error('Error during shutdown.', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Allows to register automatic graceful shutdowns
 * on signal events from underlying process, to
 * free up resources and connections.
 * @param signals - The list of NodeJS signals to react.
 * @param server - The server instance to shutdown.
 * @param database - The database connection to close.
 * @param logger - The custom logger to print system messages.
 */
function registerShutdownOnSignals(
  signals: NodeJS.Signals[],
  server: Server,
  database: DatabaseContext,
  logger: Logger,
) {
  for (const signal of signals) {
    process.on(signal, () => {
      shutdown(signal, server, database, logger)
        .then(() => {
          // eslint-disable-next-line n/no-process-exit
          process.exit(0);
        })
        .catch((error: unknown) => {
          logger.error(`Error during shutdown on ${signal}:`, error);

          // eslint-disable-next-line n/no-process-exit
          process.exit(1);
        });
    });
  }
}

/**
 * The public DSL method allowing to see a port
 * of current running server instance.
 * @param server - The server instance to ask for port.
 * @returns http port if server is running.
 * @throws {Error} if server instance was not found.
 */
function getPort(server: Server): string {
  const address = server.address();

  if (typeof address !== 'object' || address === null) {
    throw new Error('Could not get server port.');
  }

  return address.port.toString();
}
