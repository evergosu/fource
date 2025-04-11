import type { TaskContext } from 'vitest';

// Helper function to provide types for vitest-cucumber.
// Might be redundant when author will create proper types.
export const skip = (t: TaskContext) => {
  t.skip();
};
