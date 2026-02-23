import type z from 'zod';

import {
  timestamp,
  pgTable,
  boolean,
  jsonb,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const outbox = pgTable('outbox', {
  occuredAt: timestamp('occurred_at', {
    withTimezone: false,
    mode: 'date',
  })
    .defaultNow()
    .notNull(),
  processed: boolean('processed').notNull().default(false),
  aggregateId: uuid('aggregate_id').primaryKey().notNull(),
  id: uuid('id').primaryKey().notNull(),
  payload: jsonb('payload').notNull(),
  type: text('type').notNull(),
});

/**
 * ---
 * Schema for inserting an Outbox row.
 * ---
 * - used only at infrastructure boundaries.
 */
export const outboxInsertSchema = createInsertSchema(outbox).omit({
  processed: true,
  occuredAt: true,
});

export type OutboxInsertSchema = z.infer<typeof outboxInsertSchema>;
