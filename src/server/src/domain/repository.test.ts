import { AggregateNotFoundError, type Repository } from './repository';
import { UniqueIdentifier } from './unique-identifier';
import { AggregateRoot } from './aggregate-root';
import { Specification } from './specification';
import { Either } from './either';
import { Result } from './result';

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

    const result = values.filter(specification.isSatisfiedBy.bind(this));

    return result.length > 0
      ? Either.right(result)
      : Either.left(new AggregateNotFoundError());
  }

  async delete(id: FakeAggregate['id']) {
    const store = await this.store;

    if (!store.has(id.toString())) {
      return Result.fail(new AggregateNotFoundError(id));
    }

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    store.delete(id.toString());

    return Result.ok();
  }

  async findById(id: FakeAggregate['id']) {
    const store = await this.store;

    const found = store.get(id.toString());

    return found
      ? Either.right(found)
      : Either.left(new AggregateNotFoundError(id));
  }

  async findAll() {
    const store = await this.store;

    const result = [...store.values()];

    return result.length > 0
      ? Either.right(result)
      : Either.left(new AggregateNotFoundError());
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

    expect(result.isRight()).toBe(true);
    expect(result.getRight().id.equals(aggregate.id)).toBe(true);
    expect(result.getRight().isActive).toBe(true);
  });

  it('should return AggregateNotFoundError if ID not found', async () => {
    const unknownId = UniqueIdentifier.create();

    const result = await repository.findById(unknownId);

    expect(result.isLeft()).toBe(true);
    expect(result.getLeft()).toBeInstanceOf(AggregateNotFoundError);
    expect(result.getLeft().message).toContain(unknownId);
  });

  it('should retrieve all aggregates', async () => {
    const inactiveAggregate = new FakeAggregate({ isActive: false });

    await repository.save(aggregate);

    await repository.save(inactiveAggregate);

    const result = await repository.findAll();

    expect(result.isRight()).toBe(true);
    expect(result.getRight().length).toBe(2);
  });

  it('should return AggregateNotFoundError if there is no entities', async () => {
    const result = await repository.findAll();

    expect(result.isLeft()).toBe(true);
    expect(result.getLeft()).toBeInstanceOf(AggregateNotFoundError);
  });

  it('should find entities by specification', async () => {
    const inactiveAggregate = new FakeAggregate({ isActive: false });

    await repository.save(aggregate);

    await repository.save(inactiveAggregate);

    const specification = new IsActiveSpecification();

    const result = await repository.findBySpecification(specification);

    expect(result.isRight()).toBe(true);
    expect(result.getRight().length).toBe(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result.getRight().at(0)!.isActive).toBe(true);
  });

  it('should return AggregateNotFoundError if no entities match specification', async () => {
    const specification = new IsActiveSpecification();

    const result = await repository.findBySpecification(specification);

    expect(result.isLeft()).toBe(true);
    expect(result.getLeft()).toBeInstanceOf(AggregateNotFoundError);
  });

  it('should delete an aggregate by ID', async () => {
    await repository.save(aggregate);

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    const result = await repository.delete(aggregate.id);

    expect(result.isSuccess).toBe(true);

    const deletedResult = await repository.findById(aggregate.id);

    expect(deletedResult.isLeft()).toBe(true);
  });

  it('should fail deletion if ID was not found', async () => {
    const unknownId = UniqueIdentifier.create();

    // eslint-disable-next-line drizzle/enforce-delete-with-where
    const result = await repository.delete(unknownId);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(AggregateNotFoundError);
    expect(result.error.message).toContain(unknownId);
  });
});
