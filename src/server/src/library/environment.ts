import { resolvePath } from 'library/resolve-path';
import dotenv from 'dotenv';
import env from 'env-var';

const NODE_ENV = env.get('NODE_ENV').default('production').asEnum(['production', 'development', 'test']);

dotenv.config({
  path: [
    // Bundle relative path for direct nodejs usage.
    NODE_ENV === 'production' ? resolvePath(import.meta.url, `../../../.env.${NODE_ENV}`) : '',
    // Project relative path for typescript environment.
    resolvePath(import.meta.url, `../../../../.env.${NODE_ENV}`),
  ],
});

/**
 * Provides validated environment.
 * @returns object with environment settings.
 */
export function getEnvironment() {
  return {
    server: {
      database: {
        password: env.get('POSTGRES_PASSWORD').required().asString(),
        url: env.get('POSTGRES_URL').required().asUrlObject(),
        user: env.get('POSTGRES_USER').required().asString(),
      },
      url: env.get('SERVER_URL').required().asUrlObject(),
    },
    node: env.get('NODE_ENV').default('production').asEnum(['production', 'development', 'test']),
    client: {
      url: env.get('CLIENT_URL').required().asUrlObject(),
    },
    host: {
      ip: env.get('HOST_IP').required().asString(),
    },
  };
}
