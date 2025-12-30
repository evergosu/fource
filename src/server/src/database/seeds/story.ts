import { faker } from '@faker-js/faker';

import type { Database } from '../database';

import { type SelectStorySchema, story } from '../schema/story';

const mock = () => {
  const TTL_MS = 24 * 60 * 60 * 1000;

  const data: SelectStorySchema[] = [];

  for (let index = 0; index < 10; index++) {
    const createdAt = faker.date.recent({ days: 1 });
    const expiresAt = new Date(createdAt.getTime() + TTL_MS);

    data.push({
      body: faker.lorem.word({ length: 1500 }),
      title: faker.lorem.word({ length: 15 }),
      authorId: faker.string.uuid(),
      id: faker.string.uuid(),
      createdAt,
      expiresAt,
    });
  }

  return data;
};

/**
 * Database DSL method to seed story table with mock values.
 * @param database - current working database.
 */
export async function seedStory(database: Database) {
  await database.insert(story).values(mock());
}
