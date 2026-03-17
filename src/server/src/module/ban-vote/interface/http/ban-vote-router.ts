import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';

import { asyncHandler } from 'server/router/async-handler';
import { Router } from 'express';

import { VoteBanController } from './controller/vote-ban-controller';

/**
 * ---
 * Creates express router processing story action.
 * ---
 * @param commandBus In-memory implementation of CommandBus.
 */
export function createBanRouter(commandBus: InMemoryCommandBus): Router {
  const banRouter = Router();

  banRouter.post(
    '/ban',
    asyncHandler(async (request, response) => {
      const controller = new VoteBanController(commandBus);

      await controller.execute(request, response);
    }),
  );

  return banRouter;
}
