import { render, screen } from '@testing-library/react';

import Page from './page';

describe('renders', () => {
  it('has test link', () => {
    render(<Page />);

    const link = screen.getByRole('link', { name: 'test' });

    expect(link).toBeDefined();
  });
});
