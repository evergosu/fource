import type { Query } from 'server/library/ddd/application/cqrs/query/query';

import type { GetAllStoriesFailure } from './get-all-stories-failure';
import type { StoryView } from './story-view';

/**
 * ---
 * Query retrieving all stories.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GetAllStoriesQuery
  // eslint-disable-next-line prettier/prettier
  implements Query<StoryView[], GetAllStoriesFailure> { }
