import { DomainError } from './domain-error';

describe('domain error', () => {
  it('should create domain error with correct message and name', () => {
    const message = 'Test error occurred';

    class TestError extends DomainError {
      constructor() {
        super(message);
      }
    }

    const error = new TestError();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('TestDomainError');
  });
});
