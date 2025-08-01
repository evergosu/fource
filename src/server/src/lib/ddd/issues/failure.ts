/**
 * Base class for all project-specific failures.
 *
 * Base failures represent business rule violations, invariant failures,
 * or invalid states discovered during domain model validation.
 *
 * All base failures are safe for clients to consume, loggable, and can be localized.
 */
export abstract class Failure {
  public readonly name: string;
  /**
   * Creates a new instance of BaseFailure.
   * @param message The descriptive error message explaining the failure.
   */
  constructor(public readonly message: string) {
    // Set the failure name to the class name with suffix of parent class
    // to show subset of failures for better developer experience.
    this.name = new.target.name.replace(
      /Failure$/,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.getPrototypeOf(this.constructor).name as string,
    );
  }

  /**
   * Serializes current `Failure` for logging purpose.
   *@returns A formatted string.
   */
  public toString(): string {
    return `${this.name}: ${this.message}`;
  }

  /**
   * Adds better Node.js debugging support.
   * @returns serialized `Failure`.
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}
