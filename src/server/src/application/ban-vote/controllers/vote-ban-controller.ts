import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { Request } from 'express';

import { ExpressController } from 'server/library/ddd/primitives';

import type { VoteBanInput } from '../commands/vote-ban-usecase';

import { VoteBanCommand } from '../commands/vote-ban-command';

interface VoteBanRequest extends Request {
  body: VoteBanInput;
}

/**
 * ---
 * HTTP controller responsible for voting stories.
 *
 * Delegates command execution to the command bus.
 */
export class VoteBanController extends ExpressController<VoteBanRequest> {
  /** @inheritdoc */
  constructor(private readonly bus: InMemoryCommandBus) {
    super();
  }

  /** @inheritdoc */
  protected handle(request: VoteBanRequest) {
    return this.bus.dispatch(
      new VoteBanCommand(request.body.storyId, request.body.voterId),
    );
  }

  /** @inheritdoc */
  protected override handleSuccess(value: unknown): [number, unknown] {
    return [201, value];
  }
}
