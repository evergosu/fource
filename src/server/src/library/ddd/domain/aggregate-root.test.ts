import { UniqueIdentifier } from './identifiers/unique-identifier';
import { AggregateRoot } from './aggregate-root';
import { DomainEvent } from '../primitives';

class PostCreatedEvent extends DomainEvent<null> {
  public static readonly type = 'PostCreatedEvent';

  /** @inheritdoc */
  constructor(
    aggregateId: UniqueIdentifier,
    occurredAt?: Date,
    id?: UniqueIdentifier,
  ) {
    super(aggregateId, null, PostCreatedEvent.type, occurredAt, id);
  }
}

interface Properties {
  title: string;
}

class Post extends AggregateRoot<Properties> {
  public create(): void {
    this.addDomainEvent(new PostCreatedEvent(this.id));
  }

  public get title() {
    return this.properties.title;
  }
}

describe('aggregate root', () => {

  it('should create an aggregate root with an unique identifier', () => {
    const post = new Post({ title: 'foo' });

    expect(post.id).toBeInstanceOf(UniqueIdentifier);

    expect(post.title).toBe('foo');
  });

  it('should track domain events', () => {
    const post = new Post({ title: 'foo' });

    expect(post['domainEvents']).toHaveLength(0);

    post.create();

    expect(post['domainEvents']).toHaveLength(1);

    expect(post['domainEvents'][0]).toBeInstanceOf(PostCreatedEvent);
  });
});
