import { DomainFailure } from './domain-error';

describe('domain failure', () => {
  it('should create domain failure with correct message and name', () => {
    const message = 'Test failure occurred';

    class TestFailure extends DomainFailure {
      constructor() {
        super(message);
      }
    }

    const failure = new TestFailure();

    expect(failure).toBeInstanceOf(DomainFailure);
    expect(failure.message).toBe(message);
    expect(failure.name).toBe('TestDomainFailure');
  });
});
