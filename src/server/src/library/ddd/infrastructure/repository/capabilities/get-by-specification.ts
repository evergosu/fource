import type {
  InferRehydratorFailure,
  InferRehydratorDomain,
  UniqueIdentifier,
  Specification,
  Rehydrator,
  Task,
} from 'server/library/ddd/primitives';

import { DomainFailure } from 'server/library/ddd/errors';

/**
 * ---
 * Capability: Retrieve all aggregates that satisfy a given specification.
 * ---
 * Specifications encapsulate domain filtering logic and can be combined.
 */
export interface GetBySpecification<
  R extends Rehydrator<unknown, unknown, unknown>,
> {
  readonly rehydrator: R;
  /**
   * ---
   * Retrieves all aggregates that satisfy a given specification.
   * ---
   * - fails if an aggregate does not exist in the persistance.
   * - fails if an aggregate has failed rehydration step.
   * ---
   * @param specification - A specification that defines a business rule or filter.
   */
  getBySpecification(
    specification: Specification<InferRehydratorDomain<R>>,
  ): Task<
    InferRehydratorDomain<R>[],
    NoAggregateSatisfiesSpecificationFailure | InferRehydratorFailure<R>[]
  >;
}

/**
 * ---
 * Failure representing no aggregates satisfies given specification.
 */
export class NoAggregateSatisfiesSpecificationFailure extends DomainFailure {
  /**
   * ---
   * Creates domain failure with optional identifier of the aggregate.
   * @param specification - the name of given specification.
   */
  constructor(public readonly specification?: Specification<unknown>) {
    super(
      specification
        ? `No aggregates satisfies ${specification.toString()}`
        : 'No aggregates satisfies given specification',
    );
  }
}
