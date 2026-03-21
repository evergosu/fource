/**
 * ---
 * Verifies eliminator (fold / match) laws.
 * ---
 * An eliminator consumes the container and produces a plain value.
 * ---
 * @param fa Container under tests
 * @param match Container implementation of match operation
 */
export function eliminatorLaws<F, A, E, R>(fa: F, match: (fa: F, fail: (error: E) => R, ok: (a: A) => R) => R) {
  return {
    leftConsistency(error: E, f: (error: E) => R, g: (a: A) => R) {
      return match(fa, f, g) === f(error);
    },

    rightConsistency(value: A, f: (error: E) => R, g: (a: A) => R) {
      return match(fa, f, g) === g(value);
    },

    naturality(f: (error: E) => R, g: (a: A) => R, h: (r: R) => R) {
      const left = h(match(fa, f, g));

      const right = match(
        fa,
        error => h(f(error)),
        a => h(g(a)),
      );

      return left === right;
    },
  };
}
