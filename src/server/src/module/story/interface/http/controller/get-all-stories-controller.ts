import type { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';
import type { Request } from 'express';

import { GetAllStoriesQuery } from 'server/module/story/application/query/get-all-stories-query';
import { ExpressController } from 'server/library/ddd/primitives';

/**
 * ---
 * HTTP controller responsible for retrieving stories.
 *
 * Delegates query execution to the query bus.
 */
export class GetAllStoriesController extends ExpressController<Request> {
  /** @inheritdoc */
  constructor(private readonly bus: InMemoryQueryBus) {
    super();
  }

  /** @inheritdoc */
  protected handle(_request: Request) {
    return this.bus.dispatch(new GetAllStoriesQuery());
  }

  /** @inheritdoc */
  protected override handleSuccess(value: unknown): [number, unknown] {
    return [200, value];
  }
}
