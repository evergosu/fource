import type { Response, Request } from 'express';

import type { UseCase as UC } from '../../../application/use-case/use-case';
import type { Mapper as M } from '../../../infrastructure/mapper/mapper';
import type { Entity } from '../../../domain/entity';

import { Controller } from '../controller';

/**
 * Express-specific controller that adapts the base controller to Express response handling.
 */
export abstract class ExpressController<
  UseCase extends UC<unknown, unknown>,
  Mapper extends M<Entity<unknown>, unknown>,
> extends Controller<Request, Response, UseCase, Mapper> {
  protected send(response: Response, status: number, payload: unknown): void {
    response.status(status).json(payload);
  }
}
