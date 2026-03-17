import { GetAllStoriesQueryHandler } from 'server/module/story/application/query/get-all-stories-handler';
import { GetAllStoriesUseCase } from 'server/module/story/application/query/get-all-stories-usecase';
import { GetAllStoriesQuery } from 'server/module/story/application/query/get-all-stories-query';
import { StoryQueryRepository } from 'server/module/story/infrastructure/story-query-repository';
import { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';
import { StoryDatabase } from 'server/module/story/infrastructure/story-database';
import { database } from 'server/infrastructure/database/clients/postgresql';

export const queryBus = new InMemoryQueryBus();

queryBus.register(
  GetAllStoriesQuery,
  new GetAllStoriesQueryHandler(
    new GetAllStoriesUseCase(
      new StoryQueryRepository(new StoryDatabase(database)),
    ),
  ),
);
