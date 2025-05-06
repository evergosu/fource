import type { Step } from 'src/lib/step';

export const aReaderVisitsTheHomePage = (step: Step) => {
  step('a reader visits the home page', () => {
    expect(window.location.pathname).toBe('/');
  });
};
