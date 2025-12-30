import type { SelectStorySchema } from 'server/database/schema/story';

import { Mapper } from 'server/library/ddd/infrastructure/mapper/mapper';
import { Result } from 'server/library/ddd/primitives';

import { Story } from './story';

/**
 * Maps between `Story` aggregate and persistence schemas.
 */
export class StoryMapper extends Mapper<Story<'persisted'>, SelectStorySchema> {
  /**
   * Convert a `Story` aggregate to domain transfer object.
   * @param story - the aggregate root to map from.
   */
  public override toDTO(story: Story<'persisted'>): Result<SelectStorySchema> {
    return Result.ok({
      createdAt: story.createdAt().toDate(),
      expiresAt: story.expiresAt().toDate(),
      authorId: story.authorId.authorId,
      title: story.title.title,
      id: story.id.toString(),
      body: story.body.body,
    });
  }

  /**
   * Rehydrate a `Story` aggregate from a domain transfer object.
   * All domain invariants are rechecked.
   * @param raw - An raw object to reconstruct `Story` from.
   */
  public override toDomain(raw: unknown) {
    return Story.rehydrate(raw as SelectStorySchema);
  }
}
