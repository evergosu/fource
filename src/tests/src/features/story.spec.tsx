/* eslint-disable sonarjs/no-nested-functions */
import type { TestContext } from 'vitest';

import { StoryQueryRepository } from 'server/module/story/infrastructure/repository/story-query-repository';
import { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import { StoryRepository } from 'server/module/story/infrastructure/repository/story-repository';
import { StoryDatabase } from 'server/module/story/infrastructure/repository/story-database';
import { AggregateTracker } from 'server/infrastructure/orm/unit-of-work/aggregate-tracker';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { Story } from 'server/module/story/domain/story';
import { render, screen } from '@testing-library/react';
import { STEPS } from 'tests/steps';
import Page from 'client/app/page';

describeFeature(await loadFeature('./story.feature'), ({ Scenario }) => {
  const story = Story.create({
    authorId: 'John Doe',
    body: 'The content',
    title: 'The Story',
  });

  Scenario('there is a story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is available', async (context: unknown) => {
      await (context as TestContext).database.transaction(async tx => {
        const repository = StoryRepository.new({
          provider: new TransactionalDatabaseProvider(tx),
          tracker: new AggregateTracker(),
        });

        await story
          .toTask()
          .flatMap(s => repository.create(s))
          .run();

        const result = await story
          .toTask()
          .flatMap(s => repository.getById(s.id))
          .run();

        expect(result.value).not.toBeNull();
      });
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then('the story should be presented to the reader', async (context: unknown) => {
      await (context as TestContext).database.transaction(async tx => {
        const repository = StoryRepository.new({
          provider: new TransactionalDatabaseProvider(tx),
          tracker: new AggregateTracker(),
        });

        const result = await story
          .toTask()
          .flatMap(s => repository.getById(s.id))
          .run();

        render(await Page());

        expect(screen.getByRole('main')).toHaveTextContent(result.value.title.title);
      });
    });
  });

  Scenario('there is no story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is not available', async (context: unknown) => {
      await (context as TestContext).database.transaction(async tx => {
        const repository = StoryRepository.new({
          provider: new TransactionalDatabaseProvider(tx),
          tracker: new AggregateTracker(),
        });

        const queryRepository = new StoryQueryRepository(new StoryDatabase((context as TestContext).database));

        await story
          .toTask()
          .flatMap(s => repository.delete(s as Story<'persisted'>))
          .run();

        const result = await queryRepository.getAll().run();

        expect(result.isFailure()).toBeTruthy();
      });
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then('the system should indicate that there are no stories to be shawn', async () => {
      render(await Page());

      expect(screen.getByRole('main')).toHaveTextContent('There is no stories');
    });
  });
});
