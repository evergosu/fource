import type { Command } from 'server/library/ddd/application/cqrs/command/command';

import type { CreateStoryFailure } from './create-story-failure';
import type { CreateStoryInput } from './create-story-usecase';

/**
 * ---
 * Command representing an intention to create a new Story.
 *
 * Commands are part of the **write side** of CQRS and represent
 * user or system intent to perform a state mutation.
 * ---
 * Responsibilities:
 * - carry the payload required to execute the operation
 * - define the output and failure types for the command pipeline
 * ---
 * This command implements {@link CreateStoryInput} so it can be passed
 * directly into the use case without additional mapping.
 * ---
 * The command itself **contains no logic** and is treated as
 * a serializable message.
 */
export class CreateStoryCommand implements Command<string, CreateStoryFailure>, CreateStoryInput {
  /**
   * ---
   * Creates a new CreateStoryCommand instance.
   * ---
   * @param title - Raw story title provided by the caller.
   * @param body - Raw story body content.
   * @param authorId - Identifier of the author creating the story.
   */
  constructor(
    readonly title: string,
    readonly body: string,
    readonly authorId: string,
    // eslint-disable-next-line prettier/prettier
  ) { }
}
