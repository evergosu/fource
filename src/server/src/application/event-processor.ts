import { DrizzleUnitOfWork } from 'server/database/orm/unit-of-work/drizzle-unit-of-work';
import { database } from 'server/database/clients/postgresql';

import { OutboxProcessor } from './outbox/outbox-processor';
import { eventRegistry, eventBus } from './event-bus';

const processor = new OutboxProcessor(
  new DrizzleUnitOfWork(database),
  eventRegistry,
  eventBus,
);

setInterval(() => {
  processor.process(100);
}, 1000);
