import type { Entity } from '../domain/entity';

import { Result } from '../types/result';

/**
 * Abstract base class for mapping between domain entities and DTOs.
 * @template Domain - The domain entity type.
 * @template DTO - The data transfer object type.
 */
export abstract class Mapper<Domain extends Entity<unknown>, DTO> {
  /**
   * Convert a domain entity to a plain DTO.
   * @param domain - The domain entity.
   * @returns A result with plain object suitable for transport or storage.
   */
  public abstract toDTO(domain: Domain): Result<DTO>;

  /**
   * Convert a plain DTO into a domain entity.
   * @param raw - The raw DTO object.
   * @returns A result with domain entity reconstructed from the DTO.
   */
  public abstract toDomain(raw: unknown): Result<Domain>;

  /**
   * Convert an array of domain entities to DTOs.
   * @param domains - Array of domain entities.
   * @returns Array of DTOs.
   */
  public toDTOList(domains: Domain[]): Result<DTO[]> {
    return Result.combineList(domains.map(domain => this.toDTO(domain)));
  }

  /**
   * Convert an array of DTOs to domain entities.
   * @param raws - Array of DTOs.
   * @returns Array of domain entities.
   */
  public toDomainList(raws: DTO[]): Result<Domain[]> {
    return Result.combineList(raws.map(raw => this.toDomain(raw)));
  }
}
