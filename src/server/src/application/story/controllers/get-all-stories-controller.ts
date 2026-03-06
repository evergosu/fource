import type { InMemoryQueryBus } from 'server/library/ddd/application/cqrs/query/query-bus';
import type { Request } from 'express';

import { ExpressController } from 'server/library/ddd/primitives';

import { GetAllStoriesQuery } from '../queries/get-all-stories-query';

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
    return [201, value];
  }
}
