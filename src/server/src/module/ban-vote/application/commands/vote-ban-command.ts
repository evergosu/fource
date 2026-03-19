import type { Command } from 'server/library/ddd/application/cqrs/command/command';

import type { VoteBanFailure } from './vote-ban-failure';
import type { VoteBanInput } from './vote-ban-usecase';

/**
 * ---
 * Command representing an intention to create a new BanVote.
 *
 * Commands are part of the **write side** of CQRS and represent
 * user or system intent to perform a state mutation.
 * ---
 * Responsibilities:
 * - carry the payload required to execute the operation
 * - define the output and failure types for the command pipeline
 * ---
 * This command implements {@link VoteBanInput} so it can be passed
 * directly into the use case without additional mapping.
 * ---
 * The command itself **contains no logic** and is treated as
 * a serializable message.
 */
export class VoteBanCommand implements Command<string, VoteBanFailure>, VoteBanInput {
  /**
   * ---
   * Creates a new CreateBanVoteCommand instance.
   * ---
   * @param storyId - Identifier of the story under vote.
   * @param voterId - Identifier of the user voting the story.
   */
  constructor(
    readonly storyId: string,
    readonly voterId: string,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
