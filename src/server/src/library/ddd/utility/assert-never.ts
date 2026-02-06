import { Exception } from '../domain/issues/exception';

// eslint-disable-next-line prettier/prettier
class UnhandledCaseException extends Exception { }

/**
 * ---
 * Exhaustive check to use inside switch statements.
 * ---
 * @param never - value that should never come.
 */
export function assertNever(never: never): never {
  throw new UnhandledCaseException(`Unhandled case: ${JSON.stringify(never)}`);
}
