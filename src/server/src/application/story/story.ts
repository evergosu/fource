import type { NullOrUndefinedFailure } from 'server/library/ddd/errors';

import {
  UniqueIdentifier,
  AggregateRoot,
  Result,
  Guard,
} from 'server/library/ddd/primitives';

/**
 * Properties required to create or rehydrate a Story.
 */
interface Properties {
  authorIdentifier: UniqueIdentifier;
  createdAt: Date;
  expiresAt: Date;
  title: string;
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
   */
  private constructor(properties: Properties) {
    super(properties);
  }
  /**
   * Factory method to create a new story.
   * @param properties - The `StoryProperties` excluding domain ID.
   * @returns `Result` wrapping the new `Story` or a `NullOrUndefinedFailure`.
   */
  public static create(
    properties: Omit<Properties, 'createdAt' | 'expiresAt'>,
  ): Result<Story, NullOrUndefinedFailure> {
    const now = new Date();

    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

    const guard = Guard.for(properties);

    const result = Result.combine([
      guard.againstNullOrUndefined('title'),
      guard.againstNullOrUndefined('body'),
      guard.againstNullOrUndefined('authorIdentifier'),
    ]);

    return result.map(
      () =>
        new Story({
          ...properties,
          expiresAt: expiry,
          createdAt: now,
        }),
    );
  }

  /**
   * A short title of the `Story`.
   * @returns The public property.
   */
  get title(): string {
    return this.properties.title;
  }

  /**
   * A main content of the `Story`.
   * @returns The public property.
   */
  get body(): string {
    return this.properties.body;
  }

  /**
   * An `Identifier` of the `Author` who created the `Story`.
   * @returns The public property.
   */
  get authorIdentifier(): UniqueIdentifier {
    return this.properties.authorIdentifier;
  }

  /**
   * `Timestamp` when the `Story` was created.
   * @returns The public property.
   */
  get createdAt(): Date {
    return this.properties.createdAt;
  }

  /**
   * `Timestamp` when the `Story` should expire (typically 24h after creation).
   * @returns The public property.
   */
  get expiresAt(): Date {
    return this.properties.expiresAt;
  }
}
