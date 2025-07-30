import { ApplicationError } from './application-error';

describe('application error', () => {
  it('should create application error with correct message and name', () => {
    const message = 'Test error occurred';

    class TestError extends ApplicationError {
      constructor() {
        super(message);
      }
    }

    const error = new TestError();

    expect(error).toBeInstanceOf(ApplicationError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('TestApplicationError');
  });
});
