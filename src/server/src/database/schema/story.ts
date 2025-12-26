import {
  timestamp,
  pgTable,
  varchar,
  serial,
  index,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const story = pgTable(
  'story',
  {
    createdAt: timestamp('created_at', {
      withTimezone: false,
      mode: 'date',
    }).notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: false,
      mode: 'date',
    }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    id: serial('id').primaryKey().notNull(),
    authorId: uuid('author_id').notNull(),
    body: text('body').notNull(),
  },
  table => [
    index('story_created_at_idx').on(table.createdAt),
    index('story_expires_at_idx').on(table.expiresAt),
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
