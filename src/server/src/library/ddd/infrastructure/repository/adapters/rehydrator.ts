import { type Result } from 'server/library/ddd/primitives';

/**
 * ---
 * Common interface for all entity rehydrators.
 * ---
 * @template DTO - The data transfer object type.
 * @template Domain - The domain entity type.
 * @template Failure - The domain failure type.
 */
export interface Rehydrator<DTO, Domain, Failure> {
  /**
   * ---
   * Convert a plain DTO into a domain entity.
   * ---
   * @param raw - The raw DTO object.
   * @returns A `Result` with domain entity reconstructed from the DTO,
   * `DomainFailure` otherwise.
   */
  rehydrate(raw: DTO): Result<Domain, Failure>;
  /**
   * ---
   * Convert an array of DTOs into a domain entities array.
   * ---
   * @param raw - The array of DTOs.
   * @returns A `Result` with an array of domain entities
   * reconstructed from the DTOs, `DomainFailure` list otherwise.
   */
  rehydrateList(raw: DTO[]): Result<Domain[], Failure[]>;
}

/**
 * ---
 * Infer domain type from provided rehydrator.
 * ---
 * @template R - The rehydrator type to extract from.
 */
export type RehydratorDomain<R extends Rehydrator<unknown, unknown, unknown>> =
  R extends Rehydrator<unknown, infer Domain, unknown> ? Domain : never;

/**
 * ---
 * Infer failure type from provided rehydrator.
 * ---
 * @template R - The rehydrator type to extract from.
 */
export type RehydratorFailure<R extends Rehydrator<unknown, unknown, unknown>> =
  R extends Rehydrator<unknown, unknown, infer Failure> ? Failure : never;

/**
 * ---
 * Infer DTO type from provided rehydrator.
 * ---
 * @template R - The rehydrator type to extract from.
 */
export type RehydratorDTO<R extends Rehydrator<unknown, unknown, unknown>> =
  R extends Rehydrator<infer DTO, unknown, unknown> ? DTO : never;
