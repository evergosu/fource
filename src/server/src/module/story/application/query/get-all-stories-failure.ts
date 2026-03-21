import {
  type InfrastructureFailure,
  type ApplicationFailure,
  applicationFailure,
  type DomainFailure,
} from 'server/library/ddd/domain/issues/failure';

/**
 * ---
 * Failure type produced when retrieving stories fails.
 */
export type GetAllStoriesFailure = {
  readonly cause: InfrastructureFailure | DomainFailure;
  readonly _tag: 'GetAllStoriesFailure';
} & ApplicationFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const GetAllStoriesFailure = (cause: InfrastructureFailure | DomainFailure): GetAllStoriesFailure =>
  applicationFailure({
    _tag: 'GetAllStoriesFailure',
    cause,
  });
