import { BanVoteQueryRepository } from 'server/module/ban-vote/infrastructure/ban-vote-query-repository';
import { BanVoteRegisteredEvent } from 'server/module/ban-vote/domain/event/ban-vote-registered-event';
import { DomainEventRegistry } from 'server/library/ddd/domain/events/domain-event-registry';
import { BanVoteDatabase } from 'server/module/ban-vote/infrastructure/ban-vote-database';
import { StoryBanPolicy } from 'server/module/story/application/event-handler/ban-policy';
import { database } from 'server/infrastructure/database/clients/postgresql';
import { InMemoryEventBus } from 'server/library/ddd/application/event-bus';

import { commandBus } from './command-bus';

export const eventRegistry = new DomainEventRegistry();

eventRegistry.register(BanVoteRegisteredEvent);

export const eventBus = new InMemoryEventBus();

eventBus.register(
  BanVoteRegisteredEvent.type,
  new StoryBanPolicy(
    new BanVoteQueryRepository(new BanVoteDatabase(database)),
    commandBus,
    100,
  ),
);
