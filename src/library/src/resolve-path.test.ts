import { resolvePath } from './resolve-path';

describe('resolvePath', () => {
  it('should resolve relative path', () => {
    const path = resolvePath(import.meta.url, '../README.md');

    expect(path).toMatch(/\/Users\/.+\/src\/library\/README\.md$/);
  });
});
