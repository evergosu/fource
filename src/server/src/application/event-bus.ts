import { DomainEventRegistry } from 'server/library/ddd/domain/events/domain-event-registry';
import { InMemoryEventBus } from 'server/library/ddd/application/event-bus';
import { database } from 'server/database/clients/postgresql';

import { BanVoteRegisteredEvent } from './ban-vote/events/ban-vote-registered-event';
import { BanVoteQueryRepository } from './ban-vote/ban-vote-query-repository';
import { BanVoteDatabase } from './ban-vote/ban-vote-database';
import { StoryBanPolicy } from './story/policies/ban-policy';
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
