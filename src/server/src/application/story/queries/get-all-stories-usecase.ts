import type { Task } from 'server/library/ddd/primitives';

import type { StoryView } from './story-view';

import { GetAllStoriesFailure } from './get-all-stories-failure';
import { StoryQueryRepository } from '../story-query-repository';
import { StoryQueryMapper } from './story-query-mapper';

/**
 * ---
 * Retrieves all stories from persistence.
 * ---
 * This use case belongs to the query side of CQRS
 * and therefore performs **read-only operations**.
 */
export class GetAllStoriesUseCase {
  /**
   * ---
   *  Constructs new instance of GetAllStoriesUseCase.
   * ---
   * @param repository - query repository of story domain.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly repository: StoryQueryRepository) { }
  /**
   * ---
   * Executes story retrieval.
   */
  execute(): Task<StoryView[], GetAllStoriesFailure> {
    return this.repository
      .getAll()
      .map(s => StoryQueryMapper.new(200).toViews(s))
      .matchFailure({
        _: GetAllStoriesFailure,
      });
  }
}
