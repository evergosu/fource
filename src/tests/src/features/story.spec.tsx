/* eslint-disable sonarjs/no-nested-functions */
import type { TestContext } from 'vitest';
import { chromium } from 'playwright';

import { StoryQueryRepository } from 'server/module/story/infrastructure/repository/story-query-repository';
import { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import { StoryRepository } from 'server/module/story/infrastructure/repository/story-repository';
import { StoryDatabase } from 'server/module/story/infrastructure/repository/story-database';
import { AggregateTracker } from 'server/infrastructure/orm/unit-of-work/aggregate-tracker';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { Story } from 'server/module/story/domain/story';
import { STEPS } from 'tests/steps';
import { UniqueIdentifier } from 'server/library/ddd/primitives';

describeFeature(await loadFeature('./story.feature'), ({ Scenario }) => {
  Scenario('there is a story to suggest', ({ Given, When, Then }) => {
    const story = Story.create({
      authorId: UniqueIdentifier.create().value.toString(),
      body: 'The content',
      title: 'The Story',
    });

    Given('a story to suggest is available', async (context: unknown) => {
      const result = await (context as TestContext).database.transaction(async tx => {
        const repository = StoryRepository.new({
          provider: new TransactionalDatabaseProvider(tx),
          tracker: new AggregateTracker(),
        });

        await story
          .toTask()
          .flatMap(s => repository.create(s))
          .run();

        return await story
          .toTask()
          .flatMap(s => repository.getById(s.id))
          .run();
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.value).not.toBeNull();
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then('the story should be presented to the reader', async (context: unknown) => {
      const result = await (context as TestContext).database.transaction(async tx => {
        const repository = StoryRepository.new({
          provider: new TransactionalDatabaseProvider(tx),
          tracker: new AggregateTracker(),
        });

        return await story
          .toTask()
          .flatMap(s => repository.getById(s.id))
          .run();
      });

      expect(result.isSuccess()).toBe(true);

      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(process.env.NEXT_PUBLIC_BASE_URL);
      const content = await page.textContent('main');
      await browser.close();

      expect(content).toContain(result.value.title.title);
    });
  });

  Scenario('there is no story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is not available', async (context: unknown) => {
      const queryRepository = new StoryQueryRepository(new StoryDatabase((context as TestContext).database));

      const result = await queryRepository.getAll().run();

      expect(result.isFailure()).toBe(true);
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then('the system should indicate that there are no stories to be shawn', async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(process.env.NEXT_PUBLIC_BASE_URL);
      const content = await page.textContent('main');
      await browser.close();

      expect(content).toContain('There is no stories');
    });
  });
});
