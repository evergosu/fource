import { render, screen } from '@testing-library/react';

import { Story } from './story';

it('has title', () => {
  render(<Story />);
  expect(screen.getByRole('heading')).not.toBeEmptyDOMElement();
});

it('has text', () => {
  render(<Story />);
  expect(screen.getByRole('paragraph')).not.toBeEmptyDOMElement();
});
