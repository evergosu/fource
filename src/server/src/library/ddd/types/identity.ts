/**
 * ---
 * Identity function. Returns the value unchanged.
 * ---
 * Used to explicitly express "no transformation",
 * especially in widening and normalization flows.
 * ---
 * @param value - any value
 * ---
 * ```ts
 * identity(5) // 5
 * ```
 */
export const identity = <T>(value: T): T => value;
