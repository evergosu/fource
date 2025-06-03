import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { connectRepository } from 'tests/lib/connect-repository';
import { NoStoriesError, Stories } from 'server/story/story';
import { render, screen } from '@testing-library/react';
import { STEPS } from 'tests/steps';
import Page from 'client/app/page';

describeFeature(await loadFeature('./story.feature'), ({ Scenario }) => {
  Scenario('there is a story to suggest', ({ Given, When, Then }) => {
    let stories: Stories;

    Given('a story to suggest is available', async (context: unknown) => {
      stories = connectRepository(Stories, context);

      await stories.create({ title: 'The story' });

      expect(await stories.getNext()).not.toBeNull();
    });

    STEPS.aReaderVisitsTheHomePage(When);

    Then('the story should be presented to the reader', async () => {
      const story = await stories.getNext();

      render(await Page());

      expect(screen.getByRole('main')).toHaveTextContent(story.title);
    });
  });

  Scenario('there is no story to suggest', ({ Given, When, Then }) => {
    let stories: Stories;

    Given('a story to suggest is not available', async (context: unknown) => {
      stories = connectRepository(Stories, context);

      await stories.drop();

      await expect(() => stories.getNext()).rejects.toThrow(
        new NoStoriesError(),
      );
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
