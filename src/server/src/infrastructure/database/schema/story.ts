import {
  timestamp,
  pgTable,
  varchar,
  integer,
  boolean,
  index,
  check,
  uuid,
  text,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
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
    isBanned: boolean('is_banned').default(false).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    version: integer('version').notNull(),
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
 * ---
 * Schema for selecting a Story row.
 * ---
 * - used by repositories for rehydration.
 */
export const storySelectSchema = createSelectSchema(story);

/**
 * ---
 * Schema for inserting a Story row.
 * ---
 * - used only at infrastructure boundaries.
 */
export const storyInsertSchema = createInsertSchema(story).omit({
  createdAt: true,
  expiresAt: true,
  isBanned: true,
});

/**
 * ---
 * Schema for updating a Story row.
 * ---
 * - used only at infrastructure boundaries.
 */
export const storyUpdateSchema = createUpdateSchema(story).required().omit({
  createdAt: true,
  expiresAt: true,
});

export type StorySelectSchema = z.infer<typeof storySelectSchema>;
export type StoryInsertSchema = z.infer<typeof storyInsertSchema>;
export type StoryUpdateSchema = z.infer<typeof storyUpdateSchema>;
