import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';

import { asyncHandler } from 'server/interface/http/router/async-handler';
import { Router } from 'express';

import { GetAllStoriesController } from './controller/get-all-stories-controller';
import { CreateStoryController } from './controller/create-story-controller';

/**
 * ---
 * Creates express router processing story action.
 * ---
 * @param commandBus In-memory implementation of CommandBus.
 * @param queryBus In-memory implementation of QueryBus.
 */
export function createStoryRouter(
  commandBus: InMemoryCommandBus,
  queryBus: InMemoryQueryBus,
): Router {
  const storyRouter = Router();

  storyRouter.post(
    '/',
    asyncHandler(async (request, response) => {
      const controller = new CreateStoryController(commandBus);

      await controller.execute(request, response);
    }),
  );

  storyRouter.get(
    '/',
    asyncHandler(async (request, response) => {
      const controller = new GetAllStoriesController(queryBus);

      await controller.execute(request, response);
    }),
  );

  return storyRouter;
}
