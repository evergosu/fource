import type { NextFunction, Response, Request } from 'express';

/**
 * Helper that allows to reduce async boilerplate
 * when writing express handlers.
 * @param handler - async function to pass as express handler.
 * @returns express handler function.
 */
export function asyncHandler<Request_ = Request, Response_ = Response>(
  handler: (request: Request_, response: Response_, next: NextFunction) => Promise<void>,
) {
  return (request: Request_, response: Response_, next: NextFunction): void => {
    // eslint-disable-next-line promise/no-callback-in-promise
    void handler(request, response, next).catch(next);
  };
}
