/**
 * Recursively deeply freezes an object and all nested objects/arrays.
 *
 * @param object - The object to freeze.
 * @returns The frozen object.
 */
export function deepFreeze<T>(object: T): T {
  if (object == undefined || typeof object !== 'object') {
    return object;
  }

  const propertyNames = Object.getOwnPropertyNames(object) as (keyof T)[];

  for (const name of propertyNames) {
    const value = object[name];

    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
