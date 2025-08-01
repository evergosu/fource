import {
  InfrastructureException,
  InfrastructureFailure,
} from './infrastructure-error';

describe('infrastructure errors', () => {
  describe('failure', () => {
    it('should create infrastructure failure with correct message and name', () => {
      const message = 'Test failure occurred';

      class TestFailure extends InfrastructureFailure {
        constructor() {
          super(message);
        }
      }

      const failure = new TestFailure();

      expect(failure).toBeInstanceOf(InfrastructureFailure);
      expect(failure.message).toBe(message);
      expect(failure.name).toBe('TestInfrastructureFailure');
    });
  });

  describe('exception', () => {
    it('should create Infrastructure exception with correct message and name', () => {
      const message = 'Test exception occurred';

      class TestException extends InfrastructureException {
        constructor() {
          super(message);
        }
      }

      const exception = new TestException();

      expect(exception).toBeInstanceOf(InfrastructureException);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe('TestInfrastructureException');
    });
  });
});
