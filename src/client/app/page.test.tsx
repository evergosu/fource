import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { render, screen } from '@testing-library/react';

import Page from './page';

describeFeature(await loadFeature('./page.feature'), ({ Scenario }) => {
  Scenario(
    'user should see a suggested story at home page',
    ({ Given, When, Then }) => {
      Given('user at home page', () => {
        expect(window.location.pathname).toBe('/');
      });

      When('page loads', () => {
        render(<Page />);
      });

      Then('user can see a suggested story', () => {
        render(<Page />);
        expect(screen.getByRole('article')).toBeInTheDocument();
      });
    },
  );
});
