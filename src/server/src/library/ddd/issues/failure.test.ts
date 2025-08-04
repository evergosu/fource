import { Failure } from './failure';

describe('failure', () => {
  it('should create a failure with correct message and name', () => {
    const message = 'Test failure occurred';

    abstract class TestFailure extends Failure {}

    class FooFailure extends TestFailure {
      constructor() {
        super(message);
      }
    }

    const failure = new FooFailure();

    expect(failure).toBeInstanceOf(TestFailure);
    expect(failure.message).toBe(message);
    expect(failure.name).toBe('FooTestFailure');
  });
});
