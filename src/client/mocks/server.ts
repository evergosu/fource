import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

export const server = setupServer(
  http.get('https://example.com/user', () => {
    return HttpResponse.json(
      {
        id: 'this-is-the-id',
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        statusText: 'Mocked status',
        status: 200,
      },
    );
  }),
);
