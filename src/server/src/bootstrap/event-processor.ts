import { DrizzleUnitOfWork } from 'server/infrastructure/orm/unit-of-work/drizzle-unit-of-work';
import { OutboxProcessor } from 'server/module/outbox/application/processor/outbox-processor';
import { database } from 'server/infrastructure/database/clients/postgresql';

import { eventRegistry, eventBus } from './event-bus';

const processor = new OutboxProcessor(
  new DrizzleUnitOfWork(database),
  eventRegistry,
  eventBus,
);

setInterval(() => {
  processor.process(100);
}, 1000);
