/* eslint-disable prettier/prettier */
import {
  type InfrastructureFailure,
  type ApplicationFailure,
  type DomainFailure,
  applicationFailure,
} from 'server/library/ddd/domain/issues/failure';

/**
 * ---
 * Failure type representing any error occurring during
 * the execution of the CreateStory use case.
 * ---
 * This failure wraps both:
 *
 * - Domain failures (validation, invariants)
 * - Infrastructure failures (database errors, persistence)
 * ---
 * Application failures represent **application layer boundaries**
 * where lower-level errors are translated into use-case specific failures.
 */
export type CreateStoryFailure = {
  /**
   * ---
   * Original cause of the failure.
   */
  readonly cause: InfrastructureFailure | DomainFailure;

  /**
   * ---
   * Discriminant used for pattern matching.
   */
  readonly _tag: 'CreateStoryFailure';

  /**
   * ---
   * Name of the component that produced the failure.
   */
  readonly name: string;
} & ApplicationFailure;

/**
 * ---
 * Factory for creating {@link CreateStoryFailure}.
 *
 * This function is typically used when translating domain
 * or infrastructure failures at the application boundary.
 * ---
 * @param name - Name of the component producing the failure.
 */
// eslint-disable-next-line sonarjs/no-redeclare
export const CreateStoryFailure =
  (name: string) =>
    (cause: InfrastructureFailure | DomainFailure): CreateStoryFailure =>
      applicationFailure({
        _tag: 'CreateStoryFailure',
        cause,
        name,
      });
