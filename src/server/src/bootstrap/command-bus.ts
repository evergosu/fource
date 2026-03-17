import { UnitOfWorkMiddleware } from 'server/library/ddd/application/cqrs/command/middlewares/unit-of-work-middleware';
import { CreateStoryCommandHandler } from 'server/module/story/application/command/create/create-story-handler';
import { CreateStoryCommand } from 'server/module/story/application/command/create/create-story-command';
import { CreateStoryUseCase } from 'server/module/story/application/command/create/create-story-usecase';
import { VoteBanCommandHandler } from 'server/module/ban-vote/application/commands/vote-ban-handler';
import { DrizzleUnitOfWork } from 'server/infrastructure/orm/unit-of-work/drizzle-unit-of-work';
import { VoteBanCommand } from 'server/module/ban-vote/application/commands/vote-ban-command';
import { VoteBanUseCase } from 'server/module/ban-vote/application/commands/vote-ban-usecase';
import { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import { database } from 'server/infrastructure/database/clients/postgresql';

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
