/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import type { AggregateRoot } from '../aggregate-root';
import type { DomainFailure } from '../issues/failure';

import { Result } from '../../types/result';

/**
 * Represents a business policy that enforces rules or side-effectful constraints
 * on a domain object. Policies typically validate and optionally modify aggregates
 * before commands are finalized or dispatched.
 * @template Target The type of the domain target this policy applies to.
 * @template Context Optional context type (e.g. command, service dependencies).
 */
export abstract class Policy<Target extends AggregateRoot<unknown>, Context = void> {
  /**
   * Applies the policy logic to a target, optionally using additional context.
   * This may result in domain changes, event dispatching, or validation errors.
   * @param target - The domain entity or aggregate the policy is applied to.
   * @param context - Optional context (e.g., command data, user role, dependencies).
   * @returns A `Result<void, DomainError>` indicating success or failure.
   */
  public abstract apply(target: Target, context?: Context): Result<void, DomainFailure>;
}
