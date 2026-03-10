import { UnitOfWorkMiddleware } from 'server/library/ddd/application/cqrs/command/middlewares/unit-of-work-middleware';
import { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import { DrizzleUnitOfWork } from 'server/database/orm/unit-of-work/drizzle-unit-of-work';
import { database } from 'server/database/clients/postgresql';

import { CreateStoryCommandHandler } from './story/commands/create-story-handler';
import { VoteBanCommandHandler } from './ban-vote/commands/vote-ban-handler';
import { CreateStoryCommand } from './story/commands/create-story-command';
import { CreateStoryUseCase } from './story/commands/create-story-usecase';
import { VoteBanCommand } from './ban-vote/commands/vote-ban-command';
import { VoteBanUseCase } from './ban-vote/commands/vote-ban-usecase';

/**
 * ---
 * Application command bus instance.
 *
 * The command bus coordinates command dispatching and
 * executes middleware pipelines.
 */
export const commandBus = new InMemoryCommandBus();

/**
 * ---
 * Register UnitOfWork middleware.
 *
 * This middleware ensures that every command execution
 * runs inside a database transaction.
 */
commandBus.use(new UnitOfWorkMiddleware(new DrizzleUnitOfWork(database)));

/**
 * ---
 * Register command handler responsible for story creation.
 */
commandBus.register(
  CreateStoryCommand,
  new CreateStoryCommandHandler(new CreateStoryUseCase()),
);

/**
 * ---
 * Register command handler responsible for ban voting.
 */
commandBus.register(
  VoteBanCommand,
  new VoteBanCommandHandler(new VoteBanUseCase()),
);
