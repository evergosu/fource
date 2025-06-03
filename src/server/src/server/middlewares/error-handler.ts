import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'server/lib/logger';

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, _request, response) => {
    logger.error('Express error.', error);

    if (!response.headersSent) {
      response.status(500).json({ message: 'Internal Express server error.' });
    }
  };
}
