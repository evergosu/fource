import type { Command } from 'server/library/ddd/application/cqrs/command/command';

import type { BanStoryFailure } from './ban-story-failure';
import type { BanStoryInput } from './ban-story-usecase';

/**
 * ---
 * Command representing an intention to ban a persisted Story.
 *
 * Commands are part of the **write side** of CQRS and represent
 * user or system intent to perform a state mutation.
 * ---
 * Responsibilities:
 * - carry the payload required to execute the operation
 * - define the output and failure types for the command pipeline
 * ---
 * This command implements {@link BanStoryInput} so it can be passed
 * directly into the use case without additional mapping.
 * ---
 * The command itself **contains no logic** and is treated as
 * a serializable message.
 */
export class BanStoryCommand implements Command<string, BanStoryFailure>, BanStoryInput {
  /**
   * ---
   * Creates a new BanStoryCommand instance.
   * ---
   * @param storyId - Identifier of the story to ban.
   */
  // eslint-disable-next-line prettier/prettier
  constructor(readonly storyId: string) { }
}
