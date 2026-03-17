import type { BanVoteInsertSchema } from 'server/database/schema/ban-vote';

import {
  type Serializer,
  combineResults,
  Result,
} from 'server/library/ddd/primitives';

import type { BanVote } from '../domain/ban-vote';

interface BanVoteSerializer {
  insert: Serializer<BanVote<'new'>, BanVoteInsertSchema>;
}

// eslint-disable-next-line sonarjs/no-redeclare
export const BanVoteSerializer: BanVoteSerializer = {
  insert: {
    serialize(banVote) {
      return Result.ok({
        storyId: banVote.storyId.toString(),
        voterId: banVote.voterId.toString(),
        id: banVote.id.toString(),
      });
    },
    serializeList(stories) {
      return combineResults(stories.map(story => this.serialize(story)));
    },
  },
};
