import { resolvePath } from 'library/resolve-path';
import dotenv from 'dotenv';
import env from 'env-var';

const NODE_ENV = env
  .get('NODE_ENV')
  .default('production')
  .asEnum(['production', 'development', 'test']);

dotenv.config({
  path: [
    // The path is one level higher since it will be used by next.js at the root level of the package.
    resolvePath(import.meta.url, `../../.env.${NODE_ENV}`),
    // Project relative path for typescript environment.
    resolvePath(import.meta.url, `../../../.env.${NODE_ENV}`),
    resolvePath(import.meta.url, `../../../../.env.${NODE_ENV}`),
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
