import { DomainFailure } from 'server/library/ddd/errors';

/**
 * Failure indicating that a expires date value does not occur
 * in time to live after the `Story` was created.
 */
export class StoryExpiresTimeNotMatchTTLFailure extends DomainFailure {
  /**
   * Creates domain failure with provided error message.
   */
  constructor() {
    super(`Story should expire at time to live after creation date`);
  }
}
