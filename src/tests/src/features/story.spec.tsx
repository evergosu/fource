import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { story } from '@server/story/story';

describeFeature(await loadFeature('./story.feature'), ({ Scenario }) => {
  Scenario('There is a story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is available', () => {
      expect(story).toBeDefined();
    });
    When('the user accesses the story', () => {
      // expect(true).toBe(true);
      fail();
    });
    Then('the story should be presented to the user', () => {
      // expect(true).toBe(true);
      fail();
    });
  });

  Scenario('There is no story to suggest', ({ Given, When, Then }) => {
    Given('a story to suggest is not available', () => {
      // expect(true).toBe(true);
      fail();
    });
    When('the user accesses the story', () => {
      // expect(true).toBe(true);
      fail();
    });
    Then('the system should indicate that there are no stories to show', () => {
      // expect(true).toBe(true);
      fail();
    });
  });
});
