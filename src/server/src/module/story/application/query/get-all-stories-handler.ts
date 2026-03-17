/* eslint-disable prettier/prettier */
import type { QueryHandler } from 'server/library/ddd/application/cqrs/query/query-handler';
import type { Task } from 'server/library/ddd/primitives';

import type { GetAllStoriesFailure } from './get-all-stories-failure';
import type { StoryView } from './story-view';

import { GetAllStoriesUseCase } from './get-all-stories-usecase';
import { GetAllStoriesQuery } from './get-all-stories-query';

/**
 * ---
 * Handles GetAllStoriesQuery execution.
 */
export class GetAllStoriesQueryHandler
  implements QueryHandler<GetAllStoriesQuery, StoryView[], GetAllStoriesFailure> {
  /**
   * ---
   * Constructs a new CreateStoryCommandHandler.
   * ---
   * @param useCase - Application use case implementing story retrive logic.
   */
  constructor(private readonly useCase: GetAllStoriesUseCase) { }

  /**
   * ---
   * Executes the query via its associated use case.
   * ---
   * @param _query - Query instance (no parameters required).
   */
  handle(_query: GetAllStoriesQuery): Task<StoryView[], GetAllStoriesFailure> {
    return this.useCase.execute();
  }
}
