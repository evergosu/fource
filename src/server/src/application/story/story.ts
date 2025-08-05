import {
  UniqueIdentifier,
  AggregateRoot,
  Result,
  Guard,
} from 'server/library/ddd/primitives';

import { StoryTitle } from './story-title';

/**
 * Properties required to create or rehydrate a Story.
 */
interface Properties {
  authorIdentifier: UniqueIdentifier;
  title: StoryTitle;
  createdAt: Date;
  expiresAt: Date;
  body: string;
}

/**
 * Represents a short-lived user-generated story in the platform.
 * Stories include metadata and content and are the root of emoji reactions,
 * Fource actions, and moderation signals.
 */
export class Story extends AggregateRoot<Properties> {
  /**
   * Private constructor. Use `.create()` factory method instead.
   * @param properties An inner properties of an aggregate.
   * @param identifier An optional `UniqueIdentifier` of an `AggregateRoot` to rehydrate from.
   */
  private constructor(properties: Properties, identifier?: UniqueIdentifier) {
    super(properties, identifier);
  }
  /**
   * Factory method to create a new story.
   * @param raw - An raw object to reconstruct `Story` from.
   * @param raw.title - A short title of the `Story`.
   * @param raw.body - A main content of the `Story`.
   * @param raw.authorIdentifier - An `Identifier` of the `Author` who created the `Story`.
   * @param identifier - An optional `Identifier` of the `Story` to operate on.
   * @returns `Result` wrapping the new `Story` or a:
   * - `MaximumLengthExceededFailure`
   * - `MinimumLengthNotMetFailure`
   * - `NullOrUndefinedFailure`
   * - `StringFailure`
   */
  public static create(
    raw: {
      authorIdentifier: UniqueIdentifier;
      title: StoryTitle['title'];
      body: Properties['body'];
    },
    identifier?: UniqueIdentifier,
  ) {
    const now = new Date();

    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

    const guard = Guard.for(raw);

    const title = StoryTitle.create(raw.title);

    const result = Result.combine([
      title,
      guard.againstNullOrUndefined('body'),
      guard.againstNullOrUndefined('authorIdentifier'),
    ]);

    return result.map(
      () =>
        new Story(
          {
            ...raw,
            title: title.value,
            expiresAt: expiry,
            createdAt: now,
          },
          identifier,
        ),
    );
  }

  /**
   * A short title of the `Story`.
   */
  get title(): StoryTitle {
    return this.properties.title;
  }

  /**
   * A main content of the `Story`.
   */
  get body(): string {
    return this.properties.body;
  }

  /**
   * An `Identifier` of the `Author` who created the `Story`.
   */
  get authorIdentifier(): UniqueIdentifier {
    return this.properties.authorIdentifier;
  }

  /**
   * `Timestamp` when the `Story` was created.
   */
  get createdAt(): Date {
    return this.properties.createdAt;
  }

  /**
   * `Timestamp` when the `Story` should expire (typically 24h after creation).
   */
  get expiresAt(): Date {
    return this.properties.expiresAt;
  }
}
