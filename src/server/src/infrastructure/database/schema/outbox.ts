import type z from 'zod';

import { createInsertSchema, createSelectSchema, createUpdateSchema, type Json } from 'drizzle-zod';
import { timestamp, pgTable, jsonb, uuid, text } from 'drizzle-orm/pg-core';

export const outbox = pgTable('outbox', {
  occurredAt: timestamp('occurred_at', {
    withTimezone: false,
    mode: 'date',
  })
    .defaultNow()
    .notNull(),
  processedAt: timestamp('processed_at', {
    withTimezone: false,
    mode: 'date',
  }),
  aggregateId: uuid('aggregate_id').notNull(),
  payload: jsonb('payload').$type<Json>().notNull(),
  id: uuid('id').primaryKey().notNull(),
  type: text('type').notNull(),
});

/**
 * ---
 * Schema for selecting an Outbox row.
 * ---
 * - used by repositories for rehydration.
 */
export const outboxSelectSchema = createSelectSchema(outbox);

/**
 * ---
 * Schema for inserting an Outbox row.
 * ---
 * - used only at infrastructure boundaries.
 */
export const outboxInsertSchema = createInsertSchema(outbox).omit({
  processedAt: true,
  occurredAt: true,
});

/**
 * ---
 * Schema for updating an Outbox row.
 * ---
 * - used only at infrastructure boundaries.
 */
export const outboxUpdateSchema = createUpdateSchema(outbox).required().omit({
  processedAt: true,
  occurredAt: true,
});

export type OutboxSelectSchema = z.infer<typeof outboxSelectSchema>;
export type OutboxInsertSchema = z.infer<typeof outboxInsertSchema>;
export type OutboxUpdateSchema = z.infer<typeof outboxUpdateSchema>;
