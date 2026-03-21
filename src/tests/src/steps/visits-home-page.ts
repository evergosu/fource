import type { Step } from 'tests/library/step';

export const aReaderVisitsTheHomePage = (step: Step) => {
  step('a reader visits the home page', () => {
    expect(window.location.pathname).toBe('/');
  });
};
