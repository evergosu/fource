import type { DatabaseContext } from 'server/database/clients/client';

import express, { type Response, type Request, type Router } from 'express';
import { StoryRepository } from 'server/application/story/story-repository';

import { asyncHandler } from './async-handler';

/**
 * ---
 * Provides database context to async handler.
 * ---
 * @param database - database context to pass for handler.
 * @returns get story handler.
 */
function createGetStory(database: DatabaseContext) {
  return async function getStory(_: Request, response: Response) {
    const repository = new StoryRepository(database.getClient());

    await repository
      .getAll()
      .map(ss => ss[0])
      .match({
        fail: f => response.status(404).json(f.toString()),
        ok: s => response.status(200).json(s),
      })
      .run();
  };
}

/**
 * ---
 * Creates express router processing get story action.
 * ---
 * @param database - database context to pass for handler.
 * @returns get story router.
 */
export function createStoryRouter(database: DatabaseContext): Router {
  return express.Router().get('/story', asyncHandler(createGetStory(database)));
}
