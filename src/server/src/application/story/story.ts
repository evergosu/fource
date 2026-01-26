import {
  UniqueIdentifier,
  AggregateRoot,
  Result,
} from 'server/library/ddd/primitives';

import { StoryExpiresAt } from './story-expires-at';
import { StoryCreatedAt } from './story-created-at';
import { StoryAuthorId } from './story-author-id';
import { StoryTitle } from './story-title';
import { StoryBody } from './story-body';

/**
 * ---
 * Raw properties required to create a `Story`.
 */
interface CreateStoryProperties {
  authorId: string;
  title: string;
  body: string;
}

/**
 * ---
 * Raw properties required to rehydrate a `Story`.
 */
interface RehydrateStoryProperties {
  authorId: string;
  createdAt: Date;
  expiresAt: Date;
  version: number;
  title: string;
  body: string;
  id: string;
}

/**
 * ---
 * Properties of a brand new in-memory `Story`.
 */
interface NewStoryProperties {
  authorId: StoryAuthorId;
  title: StoryTitle;
  body: StoryBody;
}

/**
 * ---
 * Properties of a persisted `Story`.
 */
interface PersistedStoryProperties extends NewStoryProperties {
  createdAt: StoryCreatedAt;
  expiresAt: StoryExpiresAt;
}

type StoryState = 'persisted' | 'new';

/**
 * ---
 * Lifecycle properties of a `Story`.
 */
type Properties<State extends StoryState> = State extends 'new'
  ? NewStoryProperties
  : PersistedStoryProperties;

/**
 * ---
 * Represents a short-lived user-generated story in the platform.
 * ---
 * `Stories` include metadata and content and are the root of emoji reactions,
 * Fource actions, and moderation signals.
 */
export class Story<State extends StoryState> extends AggregateRoot<
  Properties<State>
> {
  /**
   * ---
   * Private constructor. Use `.create()` factory method instead.
   * ---
   * @param properties An inner properties of an aggregate.
   * @param identifier An optional `UniqueIdentifier` of an `AggregateRoot` to rehydrate from.
   * @param version - Incremental number, stored to control optimistic locking for concurrent modifications.
   */
  private constructor(
    properties: Properties<State>,
    identifier?: UniqueIdentifier,
    version?: number,
  ) {
    super(properties, identifier, version);
  }

  /**
   * ---
   * Factory method to create a new story.
   * ---
   * @param properties - A raw object to reconstruct `Story` from.
   * @returns `Result` wrapping the `Story` rehydrated from a raw input.
   */
  public static rehydrate(properties: RehydrateStoryProperties) {
    const id = UniqueIdentifier.create(properties.id);
    const body = StoryBody.create(properties.body);
    const title = StoryTitle.create(properties.title);
    const authorId = StoryAuthorId.create(properties.authorId);
    const createdAt = StoryCreatedAt.fromDate(properties.createdAt);
    const expiresAt = StoryExpiresAt.fromDate(properties.expiresAt, [
      createdAt.value,
    ]);

    return Result.combine([
      title,
      body,
      createdAt,
      expiresAt,
      authorId,
      id,
    ]).map(
      () =>
        new Story<'persisted'>(
          {
            createdAt: createdAt.value,
            expiresAt: expiresAt.value,
            authorId: authorId.value,
            title: title.value,
            body: body.value,
          },
          id.value,
          properties.version,
        ),
    );
  }

  /**
   * ---
   * Factory method to create a new story.
   * ---
   * @param properties - A raw object to construct `Story` from.
   * @returns `Result` wrapping new `Story`.
   */
  public static create(properties: CreateStoryProperties) {
    const body = StoryBody.create(properties.body);
    const title = StoryTitle.create(properties.title);
    const authorId = StoryAuthorId.create(properties.authorId);

    const result = Result.combine([body, title, authorId]);

    return result.map(
      () =>
        new Story<'new'>({
          authorId: authorId.value,
          title: title.value,
          body: body.value,
        }),
    );
  }

  /**
   * ---
   * Factory method to update a story title.
   * ---
   * @param title - A new title for current `Story`.
   * @returns `Result` wrapping new `Story`.
   */
  public updateTitle(this: Story<'persisted'>, title: StoryTitle['title']) {
    return StoryTitle.create(title).map(newTitle =>
      this.evolve({
        title: newTitle,
      }),
    );
  }

  /**
   * ---
   * A short title of the `Story`.
   */
  get title(): StoryTitle {
    return this.properties.title;
  }

  /**
   * ---
   * A main content of the `Story`.
   */
  get body(): StoryBody {
    return this.properties.body;
  }

  /**
   * ---
   * An `Identifier` of the `Author` who created the `Story`.
   */
  get authorId(): StoryAuthorId {
    return this.properties.authorId;
  }

  /**
   * ---
   * `Date` when the `Story` was created.
   */
  public createdAt(this: Story<'persisted'>): StoryCreatedAt {
    return this.properties.createdAt;
  }

  /**
   * ---
   * `Date` when the `Story` should expire.
   */
  public expiresAt(this: Story<'persisted'>): StoryExpiresAt {
    return this.properties.expiresAt;
  }
}
