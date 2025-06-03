import type { Server } from 'node:http';

import { getEnvironment } from 'server/lib/environment';
import express from 'express';
import cors from 'cors';

import type { DatabaseContext } from '../database/clients/client';
import type { Logger } from '../lib/logger';

import { rateLimitByEnvironment } from './middlewares/rate-limit';
import { createErrorHandler } from './middlewares/error-handler';
import { helmetByEnvironment } from './middlewares/helmet';
import { morganByEnvironment } from './middlewares/morgan';
import { createStoryRouter } from '../router/router';

export interface ServerContext {
  shutdown: (reason: string) => ReturnType<typeof shutdown>;
  getPort: () => ReturnType<typeof getPort>;
}

export function startServer(
  database: DatabaseContext,
  logger: Logger,
  port: 'environment' | 'random' = 'environment',
): ServerContext {
  const environment = getEnvironment();

  const server = express()
    .set('trust proxy', 1)
    .use(
      setupCors([environment.server.url.origin, environment.client.url.origin]),
    )
    .use(...helmetByEnvironment)
    .use(...rateLimitByEnvironment)
    .use(...morganByEnvironment)
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use('/api', createStoryRouter(database))
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

function sendReady() {
  if (process.env.NODE_ENV !== 'test' && 'send' in process) {
    process.send('ready');
  }
}

function setupCors(allowList: string[]) {
  return cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin || allowList.includes(requestOrigin)) {
        // eslint-disable-next-line unicorn/no-null
        callback(null, true);
      } else if (requestOrigin) {
        callback(new Error(`${requestOrigin} not allowed by CORS.`));
      }
    },
    credentials: true,
  });
}

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

function getPort(server: Server): string {
  const address = server.address();

  if (typeof address !== 'object' || address === null) {
    throw new Error('Could not get server port.');
  }

  return address.port.toString();
}
