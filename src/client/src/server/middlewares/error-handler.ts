import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'library/tools/logger';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (error, _request, response, _next) => {
    logger.error('Express error.', error);

    if (!response.headersSent) {
      response.status(500).json({ message: 'Internal NextJS server error.' });
    }
  };
}
