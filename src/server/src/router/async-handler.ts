import type { NextFunction, Response, Request } from 'express';

export function asyncHandler<Request_ = Request, Response_ = Response>(
  handler: (
    request: Request_,
    response: Response_,
    next: NextFunction,
  ) => Promise<void>,
) {
  return (request: Request_, response: Response_, next: NextFunction): void => {
    // eslint-disable-next-line promise/no-callback-in-promise
    void handler(request, response, next).catch(next);
  };
}
