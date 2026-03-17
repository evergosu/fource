/* eslint-disable prettier/prettier */
import type { DomainCountById } from 'server/library/ddd/domain/repository/capabilities/count-by-id';

import { AggregatePersistenceFailure } from 'server/library/ddd/domain/repository/repository-errors';
import { Task } from 'server/library/ddd/primitives';

import type { BanVote } from '../domain/ban-vote';

import {
  type BanVoteFailureMap,
  BanVoteErrorPolicy,
} from './ban-vote-error-policy';
import { BanVoteDatabase } from './ban-vote-database';


/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class BanVoteQueryRepository implements DomainCountById<BanVoteFailureMap> {
  readonly errorPolicy = BanVoteErrorPolicy;

  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  constructor(private readonly persistence: BanVoteDatabase) { }

  /**
   * ---
   * Counts how many ban votes exist for a given story.
   * ---
   * @param storyId - Identifier of the story whose votes should be counted.
   * @returns number of votes associated with the story.
   */
  public countById(
    storyId: BanVote<'persisted'>['storyId'],
  ): Task<number, AggregatePersistenceFailure> {
    return this.persistence
      .countById(storyId.toString())
      .mapError(this.errorPolicy.translate('countById'));
  }
}
