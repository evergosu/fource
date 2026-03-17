import type { StorySelectSchema } from 'server/infrastructure/database/schema/story';

import { QueryMapper } from 'server/library/ddd/application/cqrs/query/query-mapper';

import type { StoryView } from '../view/story-view';

/**
 * ---
 * Maps Story database rows into Story view DTOs.
 * ---
 * This mapper is used on the read side of the CQRS boundary.
 * It translates persistence projections directly into query
 * DTOs without creating domain aggregates.
 */
export class StoryQueryMapper extends QueryMapper<
  StorySelectSchema,
  StoryView
> {
  private constructor(private readonly previewLength: number) {
    super();
  }

  /**
   * ---
   * Constructs new instance of StoryQueryMapper.
   * ---
   * @param previewLength - maximum length of body preview.
   */
  public static new(previewLength: number) {
    return new StoryQueryMapper(previewLength);
  }
  /**
   * ---
   * Converts a StoryRow into a StoryView DTO.
   * ---
   * @param row Database row representing a story projection.
   * @returns Query DTO used by read use cases.
   */
  public toView(row: StorySelectSchema): StoryView {
    return {
      bodyPreview: this.createPreview(row.body),
      authorId: row.authorId,
      title: row.title,
      body: row.body,
      id: row.id,
    };
  }

  /**
   * ---
   * Produces a shortened preview of the story body.
   * ---
   * @param body Full story body text.
   * @returns Truncated preview string.
   */
  private createPreview(body: string): string {
    if (body.length <= this.previewLength) {
      return body;
    }

    return body.slice(0, this.previewLength) + '...';
  }
}
