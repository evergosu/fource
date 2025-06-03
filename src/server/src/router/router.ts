import type { DatabaseContext } from 'server/database/clients/client';

import express, { type Response, type Request, type Router } from 'express';

import { NoStoriesError, Stories } from '../story/story';
import { asyncHandler } from './async-handler';

function createGetStory(database: DatabaseContext) {
  return async function getStory(_: Request, response: Response) {
    try {
      const stories = new Stories(database.getClient());

      const story = await stories.getNext();

      response.status(200).json(story);
    } catch (error) {
      if (error instanceof NoStoriesError) {
        response.status(404).json({ message: error.message });
      } else {
        response.status(500).json({ message: 'Unexpected error.' });
      }
    }
  };
}

export function createStoryRouter(database: DatabaseContext): Router {
  return express.Router().get('/story', asyncHandler(createGetStory(database)));
}
