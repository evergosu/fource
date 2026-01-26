/* eslint-disable prettier/prettier */
import type { StorySelectSchema } from 'server/database/schema/story';

import {
  type ResultFailure,
  type ResultSuccess,
  type Rehydrator,
  combineResults,
} from 'server/library/ddd/primitives';

import { Story } from './story';

type StoryRehydrateResult = ReturnType<typeof Story.rehydrate>;

export type StoryRehydrateFailure = ResultFailure<StoryRehydrateResult>;
export type StoryRehydrateSuccess = ResultSuccess<StoryRehydrateResult>;

/**
 * ---
 * Delegates rehydration to `AggregateRoot`.
 * Contains helper methods to deal with batch operations.
 */
export class StoryRehydrator
  implements
  Rehydrator<StorySelectSchema, StoryRehydrateSuccess, StoryRehydrateFailure> {
  /** @inheritdoc */
  rehydrate(dto: StorySelectSchema) {
    return Story.rehydrate(dto);
  }

  /** @inheritdoc */
  rehydrateList(dtos: StorySelectSchema[]) {
    return combineResults(dtos.map(dto => this.rehydrate(dto)));
  }
}
