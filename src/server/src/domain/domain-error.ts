/**
 * Base class for all domain-specific errors.
 *
 * These errors are used to model business rule violations, invariants, and invalid states
 * within the domain layer, instead of using generic exceptions.
 */
export abstract class DomainError extends Error {
  /**
   * A unique code representing the error type.
   */
  public abstract readonly code: string;

  /**
   * Creates a new domain error.
   *
   * @param message - The error message.
   */
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Guarantees that instanceof works properly and allows safe and consistent inheritance.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
