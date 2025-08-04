import type { InfrastructureFailure } from '../infrastructure-error';
import type { DomainFailure } from '../../domain/domain-error';
import type { Entity } from '../../domain/entity';

import { combineResults } from '../../types/combinators';
import { Result } from '../../types/result';

/**
 * Abstract base class for mapping between domain entities and DTOs.
 * @template Domain - The domain entity type.
 * @template DTO - The data transfer object type.
 */
export abstract class Mapper<Domain extends Entity<unknown>, DTO> {
  /**
   * Convert a domain entity to a plain DTO.
   * @param domain - The domain entity.
   * @returns A `Result` with plain object suitable for transport or storage.
   */
  public abstract toDTO(domain: Domain): Result<DTO>;

  /**
   * Convert a plain DTO into a domain entity.
   * @param raw - The raw DTO object.
   * @returns A `Result` with domain entity reconstructed from the DTO,
   * `InfrastructureFailure` or `DomainFailure` otherwise.
   */
  public abstract toDomain(
    raw: unknown,
  ): Result<Domain, InfrastructureFailure | DomainFailure>;

  /**
   * Convert an array of domain entities to DTOs.
   * @param domains - Array of domain entities.
   * @returns A `Result` with an array of DTOs.
   */
  public toDTOList(domains: Domain[]): Result<DTO[]> {
    return combineResults(domains.map(domain => this.toDTO(domain)));
  }

  /**
   * Convert an array of DTOs to domain entities.
   * @param raws - Array of DTOs.
   * @returns A `Result` with an array of domain entities reconstructed from the DTOs,
   * `InfrastructureFailure` or `DomainFailure` otherwise.
   */
  public toDomainList(
    raws: DTO[],
  ): Result<Domain[], (InfrastructureFailure | DomainFailure)[]> {
    return combineResults(raws.map(raw => this.toDomain(raw)));
  }
}
