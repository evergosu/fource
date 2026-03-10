import {
  uniqueIndex,
  timestamp,
  pgTable,
  index,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { story } from './story';

/**
 * ---
 * Ban vote table.
 *
 * Each row represents a single user voting to ban a story.
 * ---
 * Database constraints enforce core invariants:
 * - One vote per (story, voter)
 * - Votes are removed automatically when story is deleted
 */
export const banVote = pgTable(
  'ban_vote',
  {
    /**
     * ---
     * Unique identifier of the vote.
     */
    id: uuid('id').primaryKey().notNull(),

    /**
     * ---
     * Story receiving the ban vote.
     *
     * Foreign key with cascading delete ensures
     * votes are automatically removed when the story
     * is deleted.
     */
    storyId: uuid('story_id')
      .notNull()
      .references(() => story.id, { onDelete: 'cascade' }),

    /**
     * ---
     * User casting the vote.
     */
    voterId: uuid('voter_id').notNull(),

    /**
     * ---
     * Time when vote was created.
     */
    createdAt: timestamp('created_at', {
      withTimezone: false,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
  },
  table => [
    /**
     * ---
     * Prevents duplicate votes by the same user
     * on the same story.
     */
    uniqueIndex('ban_vote_unique').on(table.storyId, table.voterId),

    /**
     * ---
     * Optimizes vote counting queries:
     *
     * SELECT COUNT(*) FROM story_ban_vote WHERE story_id = ?
     */
    index('ban_vote_story_idx').on(table.storyId),

    /**
     * ---
     * Optional index if you query votes by voter.
     */
    index('ban_vote_voter_idx').on(table.voterId),
  ],
);

/**
 * ---
 * Schema used for selecting vote rows.
 */
export const banVoteSelectSchema = createSelectSchema(banVote);

/**
 * ---
 * Schema used for inserting vote rows.
 * ---
 */
export const banVoteInsertSchema = createInsertSchema(banVote).omit({
  createdAt: true,
});

/**
 * ---
 * Types inferred from schemas.
 * ---
 */
export type BanVoteSelectSchema = z.infer<typeof banVoteSelectSchema>;

export type BanVoteInsertSchema = z.infer<typeof banVoteInsertSchema>;
