import { DomainError } from './domain-error';

describe('domain error', () => {
  it('should create domain error with correct message and code', () => {
    const message = 'Test error occurred';
    const code = 'TEST_ERROR';

    class TestError extends DomainError {
      public readonly code = code;
      constructor() {
        super(message);
      }
    }

    const error = new TestError();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.name).toBe('TestError');
  });
});
