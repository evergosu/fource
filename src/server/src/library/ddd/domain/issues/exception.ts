/**
 * Base class for all project-specific exceptions.
 *
 * Base exceptions represent invalid states that has been
 * unexpected, went wrong and caused by infrastructure or
 * programming exceptions.
 *
 * All base exceptions are safe for clients to consume, loggable, and can be localized.
 */
export abstract class Exception extends Error {
  /**
   * Creates a new instance of `Exception`.
   * @param message The descriptive error message explaining the exception.
   */
  constructor(message: string) {
    super(message);

    // Set the exception name to the class name with suffix of parent class
    // to show subset of exceptions for better developer experience.
    this.name = new.target.name.replace(
      /Exception$/,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.getPrototypeOf(this.constructor).name as string,
    );

    // Guarantees that `instanceof` works properly and allows safe and consistent inheritance.
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture cleaner stack trace in V8 environments (Node, Chrome).
    Error.captureStackTrace(this, this.constructor);
  }
}
