import { render, screen } from '@testing-library/react';

import { Story } from './story';

describe('story', () => {
  it('should be visible', () => {
    render(<Story title="title" body="body" />);

    expect(screen.getByRole('article')).toBeVisible();
  });

  it('should have title', () => {
    const title = 'title';
    const body = 'body';

    render(<Story title={title} body={'body'} />);

    expect(screen.getByRole('article')).toHaveTextContent(title);
    expect(screen.getByRole('article')).toHaveTextContent(body);
  });
});
