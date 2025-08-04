import type { Repository } from 'server/application/story/story-repository';
import type { TestContext } from 'vitest';

export function connectRepository<T extends Repository>(
  repository: new (
    ...parameters: ConstructorParameters<typeof Repository>
  ) => T,
  context: unknown,
): T {
  return new repository((context as TestContext).database);
}
