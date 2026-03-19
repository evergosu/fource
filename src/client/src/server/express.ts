import type { Logger } from 'library/tools/logger';
import type { Server } from 'node:http';

import { resolvePath } from 'library/resolve-path';
import express from 'express';
import next from 'next';
import cors from 'cors';

import { rateLimitByEnvironment } from './middlewares/rate-limit';
import { createErrorHandler } from './middlewares/error-handler';
import { helmetByEnvironment } from './middlewares/helmet';
import { morganByEnvironment } from './middlewares/morgan';
import { getEnvironment } from '../library/environment';
import { createApiProxy } from './middlewares/proxy';

export interface ServerContext {
  shutdown: (reason: string) => ReturnType<typeof shutdown>;
  getPort: () => ReturnType<typeof getPort>;
}

export async function startServer(
  logger: Logger,
  apiUrl?: URL,
  port: 'environment' | 'random' = 'environment',
): Promise<ServerContext> {
  const environment = getEnvironment();

  const isDevelopment = environment.node === 'development' || environment.node === 'test';

  const nextjs = next({
    dir: resolvePath(import.meta.url, '../..'),
    dev: isDevelopment,
  });

  const requestHandler = nextjs.getRequestHandler();

  let server: Server;

  return nextjs.prepare().then(() => {
    server = express()
      .set('trust proxy', 1)
      .use(setupCors([environment.server.url.origin, environment.client.url.origin]))
      .use(...helmetByEnvironment)
      .use(...rateLimitByEnvironment)
      .use(...morganByEnvironment)
      .use(...createApiProxy(apiUrl ?? environment.server.url, logger))
      .all('*', (request, response) => {
        void requestHandler(request, response);
      })
      .use(createErrorHandler(logger))
      .listen(port === 'random' ? 0 : environment.client.url.port, () => {
        logger.info(`NextJS running at http://localhost:${getPort(server)}`);

        sendReady();
      });

    registerShutdownOnSignals(['SIGINT', 'SIGTERM'], server, logger);

    return {
      shutdown: async (reason: string) => {
        await shutdown(reason, server, logger);
      },
      getPort: () => getPort(server),
    };
  });
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
        callback(new Error(`${requestOrigin} not allowed by CORS`));
      }
    },
    credentials: true,
  });
}

async function shutdown(reason: string, server: Server, logger: Logger): Promise<void> {
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

    logger.success('Graceful shutdown succeeded.');
  } catch (error) {
    throw new Error('Error during shutdown.', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

function registerShutdownOnSignals(signals: NodeJS.Signals[], server: Server, logger: Logger) {
  for (const signal of signals) {
    process.on(signal, () => {
      shutdown(signal, server, logger)
        .then(() => {
          process.exit(0);
        })
        .catch((error: unknown) => {
          logger.error(`Error during shutdown on ${signal}:`, error);

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
