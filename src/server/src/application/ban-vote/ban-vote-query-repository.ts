/* eslint-disable prettier/prettier */
import type { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import type { DomainCountById } from 'server/library/ddd/domain/repository/capabilities/count-by-id';

import { AggregatePersistenceFailure } from 'server/library/ddd/domain/repository/repository-errors';
import { Task } from 'server/library/ddd/primitives';

import {
  type BanVoteFailureMap,
  BanVoteErrorPolicy,
} from './ban-vote-error-policy';
import { BanVoteDatabase } from './ban-vote-database';
import { type BanVote } from './ban-vote';

interface BanVoteRepositoryEnvironment {
  provider: TransactionalDatabaseProvider;
}

/**
 * ---
 * Provides actions over persistence using Drizzle ORM.
 */
export class BanVoteRepository implements DomainCountById<BanVoteFailureMap> {
  readonly errorPolicy = BanVoteErrorPolicy;

  /**
   * ---
   * Creates new repository instance.
   * ---
   * @param persistence - persistence source of actions.
   */
  private constructor(private readonly persistence: BanVoteDatabase) { }

  /**
   * ---
   * Factory method for safely creating an `BanVoteRepository` instance.
   * ---
   * @param environment - environment in which instance should be created.
   */
  static new(environment: BanVoteRepositoryEnvironment) {
    return new BanVoteRepository(environment.provider.get(BanVoteDatabase));
  }

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
