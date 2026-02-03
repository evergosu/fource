import { StoryRepository } from 'server/application/story/story-repository';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { connectRepository } from 'tests/library/connect-repository';
import { render, screen } from '@testing-library/react';
import { Story } from 'server/application/story/story';
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
      const repository = connectRepository(StoryRepository, context);

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

    STEPS.aReaderVisitsTheHomePage(When);

    Then(
      'the story should be presented to the reader',
      async (context: unknown) => {
        const repository = connectRepository(StoryRepository, context);

        const result = await story
          .toTask()
          .flatMap(s => repository.getById(s.id))
          .run();

        render(await Page());

        expect(screen.getByRole('main')).toHaveTextContent(
          result.value.title.title,
        );
      },
    );
  });

  Scenario('there is no story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is not available', async (context: unknown) => {
      const repository = connectRepository(StoryRepository, context);

      await story
        .toTask()
        .flatMap(s => repository.delete(s.id))
        .run();

      const result = await repository.getAll().run();

      expect(result.isFailure()).toBeTruthy();
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then(
      'the system should indicate that there are no stories to be shawn',
      async () => {
        render(await Page());

        expect(screen.getByRole('main')).toHaveTextContent(
          'There is no stories',
        );
      },
    );
  });
});
