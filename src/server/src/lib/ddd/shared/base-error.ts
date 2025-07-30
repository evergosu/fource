/**
 * Base class for all project-specific errors.
 *
 * Base errors represent business rule violations, invariant failures,
 * or invalid states discovered during domain model validation.
 *
 * All base errors are safe for clients to consume, loggable, and can be localized.
 */
export abstract class BaseError extends Error {
  /**
   * Creates a new instance of BaseError.
   * @param message The descriptive error message explaining the failure.
   */
  constructor(message: string) {
    super(message);

    // Set the error name to the class name with suffix of parent class.
    this.name = new.target.name.replace(
      /Error$/,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.getPrototypeOf(this.constructor).name as string,
    );

    // Guarantees that `instanceof` works properly and allows safe and consistent inheritance.
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture cleaner stack trace in V8 environments (Node, Chrome).
    Error.captureStackTrace(this, this.constructor);
  }
}
