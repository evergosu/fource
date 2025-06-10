// Converts union to tuple, the order is not deterministic.
export type UnionTuple<T, L = T> = [T] extends [never]
  ? []
  : T extends unknown
    ? [T, ...UnionTuple<Exclude<L, T>>]
    : never;
