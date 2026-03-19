import type { CreateStoryInput } from 'server/module/story/application/command/create/create-story-usecase';
import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { Request } from 'express';

import { CreateStoryCommand } from 'server/module/story/application/command/create/create-story-command';
import { ExpressController } from 'server/library/ddd/primitives';

interface CreateStoryRequest extends Request {
  body: CreateStoryInput;
}

/**
 * ---
 * HTTP controller responsible for creating stories.
 *
 * Delegates command execution to the command bus.
 */
export class CreateStoryController extends ExpressController<CreateStoryRequest> {
  /** @inheritdoc */
  constructor(private readonly bus: InMemoryCommandBus) {
    super();
  }

  /** @inheritdoc */
  protected handle(request: CreateStoryRequest) {
    return this.bus.dispatch(new CreateStoryCommand(request.body.title, request.body.body, request.body.authorId));
  }

  /** @inheritdoc */
  protected override handleSuccess(value: unknown): [number, unknown] {
    return [201, value];
  }
}
