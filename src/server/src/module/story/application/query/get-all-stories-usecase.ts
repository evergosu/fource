import type { StoryQueryRepository } from '../../infrastructure/repository/story-query-repository';
import type { Task } from 'server/library/ddd/primitives';

import { QueryUseCase } from 'server/library/ddd/application/use-case/query-use-case';

import type { StoryView } from './view/story-view';

import { GetAllStoriesFailure } from './get-all-stories-failure';
import { StoryQueryMapper } from './mapper/story-query-mapper';

/**
 * ---
 * Retrieves all stories from persistence.
 * ---
 * This use case belongs to the query side of CQRS
 * and therefore performs **read-only operations**.
 */
export class GetAllStoriesUseCase extends QueryUseCase<void, StoryView[], GetAllStoriesFailure> {
  /**
   * ---
   *  Constructs new instance of GetAllStoriesUseCase.
   * ---
   * @param repository - query repository of story domain.
   */
  constructor(private readonly repository: StoryQueryRepository) {
    super();
  }
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
