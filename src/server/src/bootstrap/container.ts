import type { Database } from 'server/infrastructure/database/database';

import { UnitOfWorkMiddleware } from 'server/library/ddd/application/cqrs/command/middlewares/unit-of-work-middleware';
import { CreateStoryCommandHandler } from 'server/module/story/application/command/create/create-story-handler';
import { GetAllStoriesQueryHandler } from 'server/module/story/application/query/get-all-stories-handler';
import { CreateStoryCommand } from 'server/module/story/application/command/create/create-story-command';
import { CreateStoryUseCase } from 'server/module/story/application/command/create/create-story-usecase';
import { BanVoteQueryRepository } from 'server/module/ban-vote/infrastructure/ban-vote-query-repository';
import { BanVoteRegisteredEvent } from 'server/module/ban-vote/domain/event/ban-vote-registered-event';
import { VoteBanCommandHandler } from 'server/module/ban-vote/application/commands/vote-ban-handler';
import { GetAllStoriesUseCase } from 'server/module/story/application/query/get-all-stories-usecase';
import { GetAllStoriesQuery } from 'server/module/story/application/query/get-all-stories-query';
import { StoryQueryRepository } from 'server/module/story/infrastructure/story-query-repository';
import { DrizzleUnitOfWork } from 'server/infrastructure/orm/unit-of-work/drizzle-unit-of-work';
import { OutboxProcessor } from 'server/module/outbox/application/processor/outbox-processor';
import { VoteBanCommand } from 'server/module/ban-vote/application/commands/vote-ban-command';
import { VoteBanUseCase } from 'server/module/ban-vote/application/commands/vote-ban-usecase';
import { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import { DomainEventRegistry } from 'server/library/ddd/domain/events/domain-event-registry';
import { BanVoteDatabase } from 'server/module/ban-vote/infrastructure/ban-vote-database';
import { StoryBanHandler } from 'server/module/story/application/event/story-ban-handler';
import { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';
import { StoryBanPolicy } from 'server/module/story/domain/policy/story-ban-policy';
import { StoryDatabase } from 'server/module/story/infrastructure/story-database';
import { InMemoryEventBus } from 'server/library/ddd/application/event-bus';

/**
 * ---
 * Single source of global services.
 */
export class Container {
  readonly eventProcessor;
  /**
   * ---
   * Application command bus instance.
   * ---
   * The command bus coordinates command dispatching and
   * executes middleware pipelines.
   */
  readonly commandBus;
  readonly unitOfWork;
  readonly queryBus;
  readonly eventBus;
  readonly registry;

  /**
   * ---
   * Creates container with global services bootstrapped.
   * ---
   * @param database - database client.
   */
  constructor(private readonly database: Database) {
    this.unitOfWork = new DrizzleUnitOfWork(this.database);

    this.commandBus = new InMemoryCommandBus();
    this.bootstrapCommandBus();

    this.queryBus = new InMemoryQueryBus();
    this.bootstrapQueryBus();

    this.eventBus = new InMemoryEventBus();
    this.registry = new DomainEventRegistry();
    this.bootstrapEventBus();

    this.eventProcessor = new OutboxProcessor(
      this.unitOfWork,
      this.registry,
      this.eventBus,
    );
    this.bootstrapEventProcessor();
  }

  private bootstrapCommandBus() {
    /**
     * ---
     * Register UnitOfWork middleware.
     * ---
     * This middleware ensures that every command execution
     * runs inside a database transaction.
     */
    this.commandBus.use(new UnitOfWorkMiddleware(this.unitOfWork));

    /**
     * ---
     * Register command handler responsible for story creation.
     */
    this.commandBus.register(
      CreateStoryCommand,
      new CreateStoryCommandHandler(new CreateStoryUseCase()),
    );

    /**
     * ---
     * Register command handler responsible for ban voting.
     */
    this.commandBus.register(
      VoteBanCommand,
      new VoteBanCommandHandler(new VoteBanUseCase()),
    );
  }

  private bootstrapEventBus() {
    this.registry.register(BanVoteRegisteredEvent);

    this.eventBus.register(
      BanVoteRegisteredEvent.type,
      new StoryBanHandler(
        new BanVoteQueryRepository(new BanVoteDatabase(this.database)),
        this.commandBus,
        new StoryBanPolicy(100),
      ),
    );
  }

  private bootstrapQueryBus() {
    this.queryBus.register(
      GetAllStoriesQuery,
      new GetAllStoriesQueryHandler(
        new GetAllStoriesUseCase(
          new StoryQueryRepository(new StoryDatabase(this.database)),
        ),
      ),
    );
  }

  private bootstrapEventProcessor() {
    setInterval(() => {
      this.eventProcessor.process(100);
    }, 1000);
  }
}
