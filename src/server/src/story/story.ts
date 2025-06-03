import type { Database } from 'server/database/database';

import { type StorySchema, story as table } from 'server/database/schema/story';
import { desc, eq } from 'drizzle-orm';

export class NoStoriesError extends Error {
  public static readonly tag: 'NoStoriesError';
  override message = 'There is no stories' as const;
}

type StoryUpdate = Partial<Omit<StorySchema, 'id'>> & { id: number };

export class Repository {
  constructor(protected database: Database) {
    this.database = database;
  }
}

export class Stories extends Repository {
  public async getNext() {
    const [lastStory] = await this.database
      .select()
      .from(table)
      .orderBy(desc(table.id))
      .limit(1);

    if (!lastStory) {
      throw new NoStoriesError();
    }

    return lastStory;
  }

  public async isEmpty() {
    const result = await this.database.select().from(table).limit(1);

    return result.length === 0;
  }

  public async drop() {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await this.database.delete(table);
  }

  public async update(story: StoryUpdate) {
    await this.database.update(table).set(story).where(eq(table.id, story.id));
  }

  public async delete(id: number) {
    await this.database.delete(table).where(eq(table.id, id));
  }

  public async create(story: StorySchema) {
    await this.database.insert(table).values(story);
  }

  public async read() {
    return await this.database.select().from(table);
  }
}
