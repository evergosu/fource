import { Exception } from './exception';

describe('exception', () => {
  it('should create an exception with correct message and name', () => {
    const message = 'Test exception occurred';

    abstract class TestException extends Exception {}

    class FooException extends TestException {
      constructor() {
        super(message);
      }
    }

    const exception = new FooException();

    expect(exception).toBeInstanceOf(TestException);
    expect(exception.message).toBe(message);
    expect(exception.name).toBe('FooTestException');
  });
});
