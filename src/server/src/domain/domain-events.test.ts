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
  public create() {
    this.addDomainEvent(new PostCreatedEvent(this.id));
  }
}

describe('domain events', () => {
  let handler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    DomainEvents.clear();
    handler = vi.fn();
  });

  it('should register a handler for a domain event', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(DomainEvents['subscribers'].has(PostCreatedEvent.name)).toBe(true);
  });

  it('should dispatch a domain event to the registered handler', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    const post = new Post({ title: 'foo' });

    post.create();

    DomainEvents.dispatchEventsForAggregate(post);

    expect(handler).toHaveBeenCalledOnce();

    expect(handler).toHaveBeenCalledWith(expect.any(PostCreatedEvent));
  });

  it('should not call handlers after they are unsubscribed', () => {
    const unsubscribe = DomainEvents.subscribe(PostCreatedEvent, handler);

    const post = new Post({ title: 'foo' });

    post.create();

    unsubscribe();

    DomainEvents.dispatchEventsForAggregate(post);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handlers after they are cleared', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    DomainEvents.clearHandlers();

    const post = new Post({ title: 'foo' });

    post.create();

    DomainEvents.dispatchEventsForAggregate(post);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should dispatch a domain event to the marked aggregate', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    const post = new Post({ title: 'foo' });

    post.create();

    DomainEvents.dispatchAggregateEvents();

    expect(handler).toHaveBeenCalledOnce();

    expect(handler).toHaveBeenCalledWith(expect.any(PostCreatedEvent));
  });

  it('should dispatch a domain event to multiple marked aggregates', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    const postOne = new Post({ title: 'foo' });
    const postTwo = new Post({ title: 'foo' });

    postOne.create();
    postTwo.create();

    DomainEvents.dispatchAggregateEvents();

    expect(handler).toHaveBeenCalledTimes(2);

    expect(handler).toHaveBeenCalledWith(expect.any(PostCreatedEvent));
  });

  it('should not call aggregates after they are cleared', () => {
    DomainEvents.subscribe(PostCreatedEvent, handler);

    const post = new Post({ title: 'foo' });

    post.create();

    DomainEvents.clearMarkedAggregates();

    DomainEvents.dispatchAggregateEvents();

    expect(handler).not.toHaveBeenCalled();
  });

  it('should clear domain events after dispatching', () => {
    const post = new Post({ title: 'Test' });

    post.create();

    expect(post.domainEvents).toHaveLength(1);

    DomainEvents.dispatchEventsForAggregate(post);

    expect(post.domainEvents).toHaveLength(0);
  });
});
