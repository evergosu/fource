import type { OutboxInsertSchema } from 'server/infrastructure/database/schema/outbox';
import type { DomainEvent } from 'server/library/ddd/domain/events/domain-event';

import {
  type Serializer,
  combineResults,
  Result,
} from 'server/library/ddd/primitives';

interface OutboxSerializer {
  insert: Serializer<DomainEvent, OutboxInsertSchema>;
}

// eslint-disable-next-line sonarjs/no-redeclare
export const OutboxSerializer: OutboxSerializer = {
  insert: {
    serialize(event) {
      return Result.ok({
        aggregateId: event.aggregateId.toString(),
        payload: JSON.stringify(event.payload),
        id: event.id.toString(),
        type: event.type,
      });
    },
    serializeList(events) {
      return combineResults(events.map(event => this.serialize(event)));
    },
  },
};
