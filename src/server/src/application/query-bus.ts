import { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';
import { database } from 'server/database/clients/postgresql';

import { GetAllStoriesQueryHandler } from './story/queries/get-all-stories-handler';
import { GetAllStoriesUseCase } from './story/queries/get-all-stories-usecase';
import { GetAllStoriesQuery } from './story/queries/get-all-stories-query';
import { StoryQueryRepository } from './story/story-query-repository';
import { StoryDatabase } from './story/story-database';

export const queryBus = new InMemoryQueryBus();

queryBus.register(
  GetAllStoriesQuery,
  new GetAllStoriesQueryHandler(
    new GetAllStoriesUseCase(
      new StoryQueryRepository(new StoryDatabase(database)),
    ),
  ),
);
