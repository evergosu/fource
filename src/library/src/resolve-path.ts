import path from 'node:path';
import url from 'node:url';

export function resolvePath(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}
