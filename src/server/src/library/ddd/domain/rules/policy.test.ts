import { type DomainFailure, domainFailure } from '../issues/failure';
import { AggregateRoot } from '../aggregate-root';
import { Result } from '../../types/result';
import { Policy } from './policy';

class TestEntity extends AggregateRoot<{ isFoo: boolean }> {
  constructor() {
    super({ isFoo: true });
  }

  public set isFoo(boolean: boolean) {
    this.properties.isFoo = boolean;
  }

  public get isFoo() {
    return this.properties.isFoo;
  }
}

type PolicyViolated = {
  readonly _tag: 'UnknownInfrastructureFailure';
  readonly cause: unknown;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
const PolicyViolated = (cause: unknown): PolicyViolated =>
  domainFailure({
    _tag: 'UnknownInfrastructureFailure',
    cause,
  });

class PassPolicy extends Policy<TestEntity> {
  apply(target: TestEntity): Result<void, DomainFailure> {
    target.isFoo = true;

    return Result.ok();
  }
}

class FailPolicy extends Policy<TestEntity> {
  apply(target: TestEntity): Result<void, DomainFailure> {
    target.isFoo = false;

    return Result.fail(PolicyViolated('foo'));
  }
}

describe('Policy', () => {
  it('should apply a successful policy and modify target', () => {
    const target = new TestEntity();

    const policy = new PassPolicy();

    const result = policy.apply(target);

    expect(result.isSuccess()).toBe(true);
    expect(target.isFoo).toBe(true);
  });

  it('should return failure result when policy is violated', () => {
    const target = new TestEntity();

    const policy = new FailPolicy();

    const result = policy.apply(target);

    expect(result.isFailure()).toBe(true);
    expect(result.error).toBeInstanceOf(PolicyViolated);
    expect(target.isFoo).toBe(false);
  });
});
