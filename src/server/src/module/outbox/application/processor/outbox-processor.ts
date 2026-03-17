/* eslint-disable sonarjs/no-nested-functions */
import type { DrizzleUnitOfWork } from 'server/infrastructure/orm/unit-of-work/drizzle-unit-of-work';
import type { DomainEventRegistry } from 'server/library/ddd/domain/events/domain-event-registry';
import type { InMemoryEventBus } from 'server/library/ddd/application/event-bus';

import { Task } from 'server/library/ddd/primitives';

import { OutboxQueryRepository } from '../../infrastructure/outbox-query-repository';
import { OutboxRepository } from '../../infrastructure/outbox-repository';

/**
 * ---
 * Processes stored outbox events.
 * ---
 * Responsibilities:
 * - load unprocessed events
 * - deserialize them
 * - publish through event bus
 * - mark them processed
 */
export class OutboxProcessor {
  /**
   * ---
   * Creates new OutboxProcessor instance
   * ---
   * @param unitOfWork - unit of work
   * @param registry - domain event registry
   * @param eventBus - in-memory event bus
   */
  constructor(
    private readonly unitOfWork: DrizzleUnitOfWork,
    private readonly registry: DomainEventRegistry,
    private readonly eventBus: InMemoryEventBus,
    // eslint-disable-next-line prettier/prettier
  ) { }

  /**
   * ---
   * Processes a batch of outbox events.
   * ---
   * @param limit Maximum batch size.
   */
  process(limit: number) {
    this.unitOfWork.execute(({ provider }) =>
      OutboxQueryRepository.new({ provider })
        .getUnprocessed(limit)
        .flatMap(events =>
          Task.traverse(events, record =>
            this.registry
              .get(record.type)
              .rehydrate(record)
              .toTask()
              .map(event => this.eventBus.publish(event))
              .flatMap(() =>
                OutboxRepository.new({ provider }).markProcessed(record.id),
              ),
          ),
        ),
    );
  }
}
