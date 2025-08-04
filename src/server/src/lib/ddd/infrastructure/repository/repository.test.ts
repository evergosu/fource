import { UniqueIdentifier } from '../../domain/identifiers/unique-identifier';
import { Specification } from '../../domain/rules/specification';
import { AggregateNotFoundFailure } from './repository-errors';
import { AggregateRoot } from '../../domain/aggregate-root';
import { type Repository } from './repository';
import { Result } from '../../types/result';

class FakeAggregate extends AggregateRoot<{ isActive: boolean }> {
  deactivate(): void {
    this.properties.isActive = false;
  }

  activate(): void {
    this.properties.isActive = true;
  }

  get isActive(): boolean {
    return this.properties.isActive;
  }
}

class IsActiveSpecification extends Specification<FakeAggregate> {
  isSatisfiedBy(candidate: FakeAggregate): boolean {
    return candidate.isActive;
  }
}

class FakeRepository implements Repository<FakeAggregate> {
  private store = Promise.resolve(new Map<string, FakeAggregate>());

  async findBySpecification(specification: Specification<FakeAggregate>) {
    const store = await this.store;

    const values = [...store.values()];

    const result = values.filter(a => specification.isSatisfiedBy(a));

    return result.length > 0
      ? Result.ok(result)
      : Result.fail(new AggregateNotFoundFailure());
  }

  async delete(id: FakeAggregate['id']) {
    const store = await this.store;

    if (!store.has(id.toString())) {
      return Result.fail(new AggregateNotFoundFailure(id));
    }

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    store.delete(id.toString());

    return Result.ok();
  }

  async findById(id: FakeAggregate['id']) {
    const store = await this.store;

    const found = store.get(id.toString());

    return found
      ? Result.ok(found)
      : Result.fail(new AggregateNotFoundFailure(id));
  }

  async findAll() {
    const store = await this.store;

    const result = [...store.values()];

    return result.length > 0
      ? Result.ok(result)
      : Result.fail(new AggregateNotFoundFailure());
  }

  async save(aggregate: FakeAggregate) {
    const store = await this.store;

    store.set(aggregate.id.toString(), aggregate);

    return Result.ok();
  }
}

describe('repository', () => {
  let repository: FakeRepository;
  let aggregate: FakeAggregate;

  beforeEach(() => {
    repository = new FakeRepository();
    aggregate = new FakeAggregate({ isActive: true });
  });

  it('should save an aggregate', async () => {
    const result = await repository.save(aggregate);

    expect(result.isSuccess).toBe(true);
  });

  it('should retrieve an aggregate by ID', async () => {
    await repository.save(aggregate);

    const result = await repository.findById(aggregate.id);

    expect(result.isSuccess).toBe(true);
    expect(result.value.id.equals(aggregate.id)).toBe(true);
    expect(result.value.isActive).toBe(true);
  });

  it('should return AggregateNotFoundError if ID not found', async () => {
    const unknownId = UniqueIdentifier.create();

    const result = await repository.findById(unknownId.value);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
    expect(result.error.message).toContain(unknownId.value);
  });

  it('should retrieve all aggregates', async () => {
    const inactiveAggregate = new FakeAggregate({ isActive: false });

    await repository.save(aggregate);

    await repository.save(inactiveAggregate);

    const result = await repository.findAll();

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBe(2);
  });

  it('should return AggregateNotFoundError if there is no entities', async () => {
    const result = await repository.findAll();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
  });

  it('should find entities by specification', async () => {
    const inactiveAggregate = new FakeAggregate({ isActive: false });

    await repository.save(aggregate);

    await repository.save(inactiveAggregate);

    const specification = new IsActiveSpecification();

    const result = await repository.findBySpecification(specification);

    expect(result.isSuccess).toBe(true);
    expect(result.value.length).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result.value.at(0)!.isActive).toBe(true);
  });

  it('should return AggregateNotFoundError if no entities match specification', async () => {
    const specification = new IsActiveSpecification();

    const result = await repository.findBySpecification(specification);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
  });

  it('should delete an aggregate by ID', async () => {
    await repository.save(aggregate);

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    const result = await repository.delete(aggregate.id);

    expect(result.isSuccess).toBe(true);

    const deletedResult = await repository.findById(aggregate.id);

    expect(deletedResult.isFailure).toBe(true);
  });

  it('should fail deletion if ID was not found', async () => {
    const unknownId = UniqueIdentifier.create();

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    const result = await repository.delete(unknownId.value);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);
    expect(result.error.message).toContain(unknownId.value);
  });
});
