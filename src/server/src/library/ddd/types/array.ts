/**
 * ---
 * Represents an array that is statically guaranteed to contain
 * at least one element.
 * ---
 * This type encodes the invariant at the type level and allows
 * safe usage of operations like `head`, `reduce`, or indexed access
 * without additional runtime checks.
 * ---
 * @template T - Element type.
 * ---
 * ```ts
 * const values: NonEmptyArray<number> = [1, 2, 3];
 * const first = values[0]; // always defined
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];
