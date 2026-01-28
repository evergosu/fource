import { StringFailure } from '../../../errors';
import { makeGuards } from '../make-guards';

/**
 * ---
 * Checks that value is a `string`.
 * ---
 * @param value - The value to check.
 */
function isString(value: unknown): value is string {
  return (
    typeof value === 'string' ||
    Object.prototype.toString.call(value) === '[object String]'
  );
}

export const GuardString = makeGuards(
  isString,
  name => new StringFailure(name),
);
