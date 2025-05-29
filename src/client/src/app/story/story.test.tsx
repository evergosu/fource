import { render, screen } from '@testing-library/react';

import { Story } from './story';

describe('Story', () => {
  it('should be visible', () => {
    render(<Story title="title" />);

    expect(screen.getByRole('article')).toBeVisible();
  });

  it('should have title', () => {
    const title = 'title';

    render(<Story title={title} />);

    expect(screen.getByRole('article')).toHaveTextContent(title);
  });
});
