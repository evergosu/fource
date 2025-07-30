import { InfrastructureError } from './infrastructure-error';

describe('infrastructure error', () => {
  it('should create infrastructure error with correct message and name', () => {
    const message = 'Test error occurred';

    class TestError extends InfrastructureError {
      constructor() {
        super(message);
      }
    }

    const error = new TestError();

    expect(error).toBeInstanceOf(InfrastructureError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('TestInfrastructureError');
  });
});
