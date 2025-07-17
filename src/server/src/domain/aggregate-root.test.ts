import { type DomainEvent, DomainEvents } from './domain-events';
import { UniqueIdentifier } from './unique-identifier';
import { AggregateRoot } from './aggregate-root';

class PostCreatedEvent implements DomainEvent {
  public readonly occurredAt = new Date();

  constructor(public readonly aggregateId: UniqueIdentifier) {}
}

interface Properties {
  title: string;
}

class Post extends AggregateRoot<Properties> {
  public create(): void {
    this.addDomainEvent(new PostCreatedEvent(this.id));
  }
}

describe('aggregate root', () => {
  beforeEach(() => {
    DomainEvents.clear();
  });

  it('should create an aggregate root with an unique identifier', () => {
    const post = new Post({ title: 'foo' });

    expect(post.id).toBeInstanceOf(UniqueIdentifier);

    expect(post.properties.title).toBe('foo');
  });

  it('should track domain events', () => {
    const post = new Post({ title: 'foo' });

    expect(post.domainEvents).toHaveLength(0);

    post.create();

    expect(post.domainEvents).toHaveLength(1);

    expect(post.domainEvents[0]).toBeInstanceOf(PostCreatedEvent);
  });

  it('should register itself for dispatch on adding an event', () => {
    const post = new Post({ title: 'foo' });

    const spy = vi.spyOn(DomainEvents, 'markAggregateForDispatch');

    post.create();

    expect(spy).toHaveBeenCalledOnce();

    expect(spy).toHaveBeenCalledWith(post);
  });
});
