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
export const StoryRehydrator: Rehydrator<StorySelectSchema, StoryRehydrateSuccess, StoryRehydrateFailure> = {
  rehydrateList(dtos: StorySelectSchema[]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return combineResults(dtos.map(dto => this.rehydrate(dto))).mapError(x => x.at(0)!);
  },
  rehydrate(dto: StorySelectSchema) {
    return Story.rehydrate(dto);
  }
}
