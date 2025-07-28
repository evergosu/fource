import { UniqueIdentifier } from './unique-identifier';

/**
 * Base class representing a domain entity with a unique identity.
 *
 * `Entities` are defined by their identity (ID), not just their properties.
 * Two entities are considered equal if they share the same ID, regardless of their properties.
 * @template T is the shape of the entity's properties.
 */
export abstract class Entity<T> {
  /**
   * The unique identity of this entity.
   */
  protected readonly _id: UniqueIdentifier;

  /**
   * Constructs a new `Entity` instance.
   * @param properties - The entity's domain properties.
   * @param id - An optional pre-defined unique identifier. If not provided, a new one will be generated.
   * @param shouldFreeze - An optional freeze of an entity to ensure that object is not extensible.
   */
  constructor(
    public readonly properties: T,
    id?: UniqueIdentifier,
    shouldFreeze = true,
  ) {
    this._id = id ?? UniqueIdentifier.create();
    this.properties = properties;
    if (shouldFreeze) {
      Object.freeze(this);
    }
  }

  /**
   * The unique identifier of current entity.
   * @returns the entity's unique identifier.
   */
  public get id(): UniqueIdentifier {
    return this._id;
  }

  /**
   * Type guard to check whether a given value is an instance of an `Entity`.
   * @param value - The value to check.
   * @returns `true` if the value is an `Entity`, `false` otherwise.
   */
  public static isEntity(value: unknown): value is Entity<unknown> {
    return value instanceof Entity;
  }

  /**
   * Compares this `Entity` with another to determine equality.
   * @param entity - The other `Entity` to compare against.
   * @returns `true` if unique identifiers match, `false` otherwise.
   */
  public equals(entity?: Entity<unknown>): boolean {
    if (!entity) return false;

    if (this === entity) {
      return true;
    }

    if (!Entity.isEntity(entity)) {
      return false;
    }

    return this._id.equals(entity._id);
  }
}
