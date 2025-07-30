import type { InfrastructureError } from '../infrastructure-error';
import type { DomainError } from '../../domain/domain-error';
import type { Entity } from '../../domain/entity';

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
   * `InfrastructureError` or `DomainError` otherwise.
   */
  public abstract toDomain(
    raw: unknown,
  ): Result<Domain, InfrastructureError | DomainError>;

  /**
   * Convert an array of domain entities to DTOs.
   * @param domains - Array of domain entities.
   * @returns A `Result` with an array of DTOs.
   */
  public toDTOList(domains: Domain[]): Result<DTO[]> {
    return Result.combineList(domains.map(domain => this.toDTO(domain)));
  }

  /**
   * Convert an array of DTOs to domain entities.
   * @param raws - Array of DTOs.
   * @returns A `Result` with an array of domain entities reconstructed from the DTOs,
   * `InfrastructureError` or `DomainError` otherwise.
   */
  public toDomainList(
    raws: DTO[],
  ): Result<Domain[], InfrastructureError | DomainError> {
    return Result.combineList(raws.map(raw => this.toDomain(raw)));
  }
}
