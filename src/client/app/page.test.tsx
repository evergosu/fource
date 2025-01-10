import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { render, screen } from '@testing-library/react';

import Page from './page';

describeFeature(await loadFeature('./page.feature'), ({ Scenario }) => {
  Scenario('Should have test link at home page', ({ Given, When, Then }) => {
    Given('User at home page', () => {
      expect(window.location.pathname).toBe('/');
    });

    When('Page loads', () => {
      render(<Page />);
    });

    Then('User can see test link', () => {
      render(<Page />);
      expect(screen.getByRole('link', { name: 'test' })).toBeInTheDocument();
    });
  });
});
