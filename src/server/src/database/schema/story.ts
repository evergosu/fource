import {
  timestamp,
  pgTable,
  varchar,
  index,
  check,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

export const story = pgTable(
  'story',
  {
    expiresAt: timestamp('expires_at', {
      withTimezone: false,
      mode: 'date',
    })
      .default(sql`now() + interval '24 hours'`)
      .notNull(),
    createdAt: timestamp('created_at', {
      withTimezone: false,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    id: uuid('id').primaryKey().notNull(),
    authorId: uuid('author_id').notNull(),
    body: text('body').notNull(),
  },
  table => [
    index('created_at_idx').on(table.createdAt),
    index('expires_at_idx').on(table.expiresAt),
    check(
      'expiry_24h_check',
      sql`EXTRACT(EPOCH FROM ${table.expiresAt} - ${table.createdAt}) = 86400`,
    ),
  ],
);

/**
 * Schema for inserting a Story row.
 * Used only at infrastructure boundaries.
 */
export const insertStorySchema = createInsertSchema(story);

/**
 * Schema for selecting a Story row.
 * Used by repositories for rehydration.
 */
export const selectStorySchema = createSelectSchema(story);

export type InsertStorySchema = z.infer<typeof insertStorySchema>;
export type SelectStorySchema = z.infer<typeof selectStorySchema>;
