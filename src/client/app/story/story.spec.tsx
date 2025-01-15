import { render, screen } from '@testing-library/react';

import { Story } from './story';

it('contains title', () => {
  render(<Story />);
  expect(screen.getByRole('heading')).not.toBeEmptyDOMElement();
});

it('contains text', () => {
  render(<Story />);
  expect(screen.getByRole('paragraph')).not.toBeEmptyDOMElement();
});
