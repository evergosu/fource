/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-nested-functions */
import { type DomainFailure, domainFailure } from 'server/library/ddd/domain/issues/failure';
import { UniqueIdentifier, AggregateRoot, Result } from 'server/library/ddd/primitives';

import { StoryCreatedAt } from './value-object/story-created-at';
import { StoryExpiresAt } from './value-object/story-expires-at';
import { StoryAuthorId } from './value-object/story-author-id';
import { StoryTitle } from './value-object/story-title';
import { StoryBody } from './value-object/story-body';

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
  isBanned: boolean;
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
  isBanned: boolean;
}

type StoryState = 'persisted' | 'new';

/**
 * ---
 * Lifecycle properties of a `Story`.
 */
type Properties<State extends StoryState> = State extends 'new' ? NewStoryProperties : PersistedStoryProperties;

/**
 * ---
 * Represents a short-lived user-generated story in the platform.
 * ---
 * `Stories` include metadata and content and are the root of emoji reactions,
 * Fource actions, and moderation signals.
 */
export class Story<State extends StoryState> extends AggregateRoot<Properties<State>> {
  /**
   * ---
   * Private constructor. Use `.create()` factory method instead.
   * ---
   * @param properties An inner properties of an aggregate.
   * @param identifier An optional `UniqueIdentifier` of an `AggregateRoot` to rehydrate from.
   * @param version - Incremental number, stored to control optimistic locking for concurrent modifications.
   */
  private constructor(properties: Properties<State>, identifier?: UniqueIdentifier, version?: number) {
    super(properties, identifier, version);
  }

  /**
   * ---
   * Factory method to create a new story.
   * ---
   * @param title - story title.
   * @returns `Result` wrapping new `Story`.
   */
  private static readonly createNew = (title: StoryTitle) => (body: StoryBody) => (authorId: StoryAuthorId) =>
    new Story<'new'>({
      authorId,
      title,
      body,
    });

  /**
   * ---
   * Factory method to create a persisted story.
   * ---
   * @param id - story identifier.
   * @returns `Result` wrapping persisted `Story`.
   */
  private static readonly createPersisted =
    (id: UniqueIdentifier) =>
      (version: number) =>
        (isBanned: boolean) =>
          (title: StoryTitle) =>
            (body: StoryBody) =>
              (authorId: StoryAuthorId) =>
                (createdAt: StoryCreatedAt) =>
                  (expiresAt: StoryExpiresAt) =>
                    new Story<'persisted'>(
                      {
                        createdAt,
                        expiresAt,
                        isBanned,
                        authorId,
                        title,
                        body,
                      },
                      id,
                      version,
                    );

  /**
   * ---
   * Factory method to create a new story.
   * ---
   * @param properties - A raw object to reconstruct `Story` from.
   * @returns `Result` wrapping the `Story` rehydrated from a raw input.
   */
  public static rehydrate(properties: RehydrateStoryProperties) {
    const createdAt = StoryCreatedAt.fromDate(properties.createdAt);

    return Result.ok(this.createPersisted)
      .ap(UniqueIdentifier.create(properties.id))
      .ap(Result.ok(properties.version))
      .ap(Result.ok(properties.isBanned))
      .ap(StoryTitle.create(properties.title))
      .ap(StoryBody.create(properties.body))
      .ap(StoryAuthorId.create(properties.authorId))
      .ap(createdAt)
      .ap(createdAt.flatMap(ca => StoryExpiresAt.fromDate(properties.expiresAt, [ca])))
      .matchFailure({ _: StoryFailure(this.name) });
  }

  /**
   * ---
   * Factory method to create a new story.
   * ---
   * @param properties - A raw object to construct `Story` from.
   * @returns `Result` wrapping new `Story`.
   */
  public static create(properties: CreateStoryProperties) {
    return Result.ok(this.createNew)
      .ap(StoryTitle.create(properties.title))
      .ap(StoryBody.create(properties.body))
      .ap(StoryAuthorId.create(properties.authorId))
      .matchFailure({ _: StoryFailure(this.name) });
  }

  /**
   * ---
   * Update a story title.
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
   * Ban a story.
   */
  public ban(this: Story<'persisted'>) {
    return this.evolve({ isBanned: true });
  }

  /**
   * ---
   * A short title of the `Story`.
   */
  isBanned(this: Story<'persisted'>): boolean {
    return this.properties.isBanned;
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

export type StoryFailure = {
  readonly cause: DomainFailure;
  readonly _tag: 'StoryFailure';
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const StoryFailure =
  (name: string) =>
    (cause: DomainFailure): StoryFailure =>
      domainFailure({
        _tag: 'StoryFailure',
        cause,
        name,
      });
