import type { Response, Request } from 'express';

import { Controller } from '../controller';

/**
 * ---
 * Express-specific controller that adapts the base controller to Express response handling.
 */
export abstract class ExpressController<R extends Request> extends Controller<
  R,
  Response
> {
  protected send(response: Response, status: number, payload: unknown): void {
    response.status(status).json(payload);
  }
}
