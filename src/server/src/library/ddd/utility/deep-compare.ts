/**
 * Recursively compares two values for deep structural equality.
 *
 * Supports comparison of:
 * - Primitives (`string`, `number`, `boolean`, `null`, `undefined`)
 * - Plain objects (own enumerable properties)
 * - Arrays (order-sensitive)
 * - Dates (by time value)
 *
 * Limitations:
 * - Does not handle special objects (e.g., `Set`, `Map`, `RegExp`, `Function`)
 * - Only compares own properties (prototype chain is ignored)
 * - Property order in objects is not relevant (uses key presence, not order)
 *
 * This function is suitable for domain-driven design (DDD) equality checks
 * where immutability, pure value semantics, and deterministic comparison are required.
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns `true` if both values are deeply equal; otherwise, `false`.
 */
export function deepCompare(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (a === null || b === null) return a === b;

  if (typeof a !== 'object') return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  const isArrayA = Array.isArray(a);

  const isArrayB = Array.isArray(b);

  if (isArrayA !== isArrayB) return false;

  if (isArrayA && isArrayB) {
    const arrayA = a as unknown[];

    const arrayB = b as unknown[];

    if (arrayA.length !== arrayB.length) return false;

    return arrayA.every((element, index) => deepCompare(element, arrayB[index]));
  }

  const objectA = a as Record<string, unknown>;

  const objectB = b as Record<string, unknown>;

  const keysA = Object.keys(objectA);

  const keysB = Object.keys(objectB);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => keysB.includes(key) && deepCompare(objectA[key], objectB[key]));
}
