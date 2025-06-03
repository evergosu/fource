import { faker } from '@faker-js/faker';

import type { Database } from '../database';

import { type StorySchema, story } from '../schema/story';

const mock = () => {
  const data: StorySchema[] = [];

  for (let index = 0; index < 10; index++) {
    data.push({
      title: faker.lorem.word({ length: 15 }),
    });
  }

  return data;
};

export async function seedStory(database: Database) {
  await database.insert(story).values(mock());
}
