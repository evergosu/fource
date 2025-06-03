import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const story = pgTable('story', {
  title: varchar('title', { length: 255 }).notNull(),
  id: serial('id').primaryKey().notNull(),
});

export const storySchema = createInsertSchema(story);

export type StorySchema = z.infer<typeof storySchema>;
