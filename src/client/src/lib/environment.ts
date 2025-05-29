import path from 'node:path';
import dotenv from 'dotenv';
import url from 'node:url';
import env from 'env-var';

function resolve(metaUrl: string, relativePath: string) {
  return path.resolve(path.dirname(url.fileURLToPath(metaUrl)), relativePath);
}

const NODE_ENV = env
  .get('NODE_ENV')
  .default('production')
  .asEnum(['production', 'development', 'test']);

dotenv.config({
  path: [
    // The path is one level higher since it will be used by next.js at the root level of the package.
    resolve(import.meta.url, `../../.env.${NODE_ENV}`),
    // Project relative path for typescript environment.
    resolve(import.meta.url, `../../../.env.${NODE_ENV}`),
    resolve(import.meta.url, `../../../../.env.${NODE_ENV}`),
  ],
});

export function getEnvironment() {
  return {
    node: env
      .get('NODE_ENV')
      .default('production')
      .asEnum(['production', 'development', 'test']),
    client: {
      url: env.get('CLIENT_URL').required().asUrlObject(),
    },
    server: {
      url: env.get('SERVER_URL').required().asUrlObject(),
    },
  };
}
