/**
 * ---
 * Base structural contract for all failures in the system.
 * Failures are immutable, serializable, and safe to expose.
 */
interface Failure {
  readonly _tag: string;
}

declare const DomainFailureBrand: unique symbol;
declare const ApplicationFailureBrand: unique symbol;
declare const InfrastructureFailureBrand: unique symbol;

/**
 * ---
 * Nominal category wrappers.
 * These are never inspected at runtime.
 */
export type DomainFailure = {
  readonly [DomainFailureBrand]: true;
} & Failure;

export type ApplicationFailure = {
  readonly [ApplicationFailureBrand]: true;
} & Failure;

export type InfrastructureFailure = {
  readonly [InfrastructureFailureBrand]: true;
} & Failure;

/**
 * ---
 * Failure factory. Indicates violation of a domain invariant.
 * ---
 * @param payload - meaningful payload.
 */
export function domainFailure<T extends Failure>(
  payload: T,
): DomainFailure & T {
  return payload as DomainFailure & T;
}

/**
 * ---
 * Failure factory. Indicates violation of an application invariant.
 * ---
 * @param payload - meaningful payload.
 */
export function applicationFailure<T extends Failure>(
  payload: T,
): ApplicationFailure & T {
  return payload as ApplicationFailure & T;
}

/**
 * ---
 * Failure factory. Indicates violation of an infrastructure invariant.
 * ---
 * @param payload - meaningful payload.
 */
export function infrastructureFailure<T extends Failure>(
  payload: T,
): InfrastructureFailure & T {
  return payload as InfrastructureFailure & T;
}
