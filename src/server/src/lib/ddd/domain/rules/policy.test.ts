import { AggregateRoot } from '../aggregate-root';
import { DomainFailure } from '../domain-error';
import { Result } from '../../types/result';
import { Policy } from './policy';

class TestEntity extends AggregateRoot<{ isFoo: boolean }> {
  constructor() {
    super({ isFoo: true });
  }
}

class PolicyViolated extends DomainFailure {
  constructor() {
    super('Policy condition was not met');
  }
}

class PassPolicy extends Policy<TestEntity> {
  apply(target: TestEntity): Result<void, DomainFailure> {
    target.properties.isFoo = true;

    return Result.ok();
  }
}

class FailPolicy extends Policy<TestEntity> {
  apply(target: TestEntity): Result<void, DomainFailure> {
    target.properties.isFoo = false;

    return Result.fail(new PolicyViolated());
  }
}

describe('Policy', () => {
  it('should apply a successful policy and modify target', () => {
    const target = new TestEntity();

    const policy = new PassPolicy();

    const result = policy.apply(target);

    expect(result.isSuccess).toBe(true);
    expect(target.properties.isFoo).toBe(true);
  });

  it('should return failure result when policy is violated', () => {
    const target = new TestEntity();

    const policy = new FailPolicy();

    const result = policy.apply(target);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PolicyViolated);
    expect(target.properties.isFoo).toBe(false);
  });
});
