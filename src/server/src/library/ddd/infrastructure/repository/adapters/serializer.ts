import { type Result } from 'server/library/ddd/primitives';

/**
 * ---
 * Common interface for all entity serializers.
 * ---
 * @template Domain - The domain entity type.
 * @template DTO - The data transfer object type.
 */
export interface Serializer<Domain, DTO> {
  /**
   * ---
   * Convert a domain entity to a plain DTO.
   * ---
   * @param domain - The domain entity.
   * @returns A `Result` with plain object suitable for transport or storage.
   */
  serialize(domain: Domain): Result<DTO, never>;
  /**
   * ---
   * Convert an array of domain entities to an array of DTOs.
   * ---
   * @param domains - The array of domain entities.
   * @returns A `Result` with an array of objects suitable for transport or storage.
   */
  serializeList(domains: Domain[]): Result<DTO[], never[]>;
}

/**
 * ---
 * Infer domain type from provided serializer.
 * ---
 * @template S - The serializer type to extract from.
 */
export type InferSerializerDomain<S extends Serializer<unknown, unknown>> =
  S extends Serializer<infer Domain, unknown> ? Domain : never;

/**
 * ---
 * Infer DTO type from provided serializer.
 * ---
 * @template S - The serializer type to extract from.
 */
export type InferSerializerDTO<S extends Serializer<unknown, unknown>> =
  S extends Serializer<unknown, infer DTO> ? DTO : never;
