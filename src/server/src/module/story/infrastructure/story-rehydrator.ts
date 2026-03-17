/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { StorySelectSchema } from 'server/infrastructure/database/schema/story';

import {
  type ResultFailure,
  type ResultSuccess,
  type Rehydrator,
  combineResults,
} from 'server/library/ddd/primitives';

import { Story } from '../domain/story';

type StoryRehydrateResult = ReturnType<typeof Story.rehydrate>;

export type StoryRehydrateFailure = ResultFailure<StoryRehydrateResult>;
export type StoryRehydrateSuccess = ResultSuccess<StoryRehydrateResult>;

/**
 * ---
 * Delegates rehydration to `AggregateRoot`.
 * Contains helper methods to deal with batch operations.
 */
export const StoryRehydrator: Rehydrator<
  StorySelectSchema,
  StoryRehydrateSuccess,
  StoryRehydrateFailure
> = {
  rehydrateList(dtos: StorySelectSchema[]) {
    return combineResults(dtos.map(dto => this.rehydrate(dto))).mapError(
      x => x.at(0)!,
    );
  },
  rehydrate(dto: StorySelectSchema) {
    return Story.rehydrate(dto);
  },
};
