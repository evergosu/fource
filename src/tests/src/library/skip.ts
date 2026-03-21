import type { TestContext } from 'vitest';

// Helper function to provide types for vitest-cucumber.
// Might be redundant when author will create proper types.
export function skip(t: TestContext) {
  t.skip();
}
