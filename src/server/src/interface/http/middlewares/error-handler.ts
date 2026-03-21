import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'library/tools/logger';

/**
 * Creates error handler middleware that process internal errors.
 * @param logger - system logger interface.
 * @returns error handler for current request.
 */
export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, _request, response, _next) => {
    logger.error('Express error.', error);

    if (!response.headersSent) {
      response.status(500).json({ message: 'Internal Express server error.' });
    }
  };
}
