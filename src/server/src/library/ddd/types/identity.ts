/**
 * ---
 * Identity sentinel.
 * ---
 * Used to explicitly express "no transformation",
 * especially in widening and normalization flows.
 */
export const identity: unique symbol = Symbol('identity');

export type Identity = typeof identity;
