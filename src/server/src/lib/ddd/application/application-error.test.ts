import { ApplicationException, ApplicationFailure } from './application-error';

describe('application errors', () => {
  describe('failure', () => {
    it('should create application failure with correct message and name', () => {
      const message = 'Test failure occurred';

      class TestFailure extends ApplicationFailure {
        constructor() {
          super(message);
        }
      }

      const failure = new TestFailure();

      expect(failure).toBeInstanceOf(ApplicationFailure);
      expect(failure.message).toBe(message);
      expect(failure.name).toBe('TestApplicationFailure');
    });
  });

  describe('exception', () => {
    it('should create application exception with correct message and name', () => {
      const message = 'Test exception occurred';

      class TestException extends ApplicationException {
        constructor() {
          super(message);
        }
      }

      const exception = new TestException();

      expect(exception).toBeInstanceOf(ApplicationException);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe('TestApplicationException');
    });
  });
});
