import type { InMemoryCommandBus } from 'server/library/ddd/application/cqrs/command/command-bus';
import type { VoteBanInput } from 'server/module/ban-vote/application/commands/vote-ban-usecase';
import type { Request } from 'express';

import { VoteBanCommand } from 'server/module/ban-vote/application/commands/vote-ban-command';
import { ExpressController } from 'server/library/ddd/primitives';

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
