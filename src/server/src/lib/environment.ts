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
    // Bundle relative path for direct nodejs usage.
    NODE_ENV === 'production'
      ? resolve(import.meta.url, `../../../.env.${NODE_ENV}`)
      : '',
    // Project relative path for typescript environment.
    resolve(import.meta.url, `../../../../.env.${NODE_ENV}`),
  ],
});

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
    node: env
      .get('NODE_ENV')
      .default('production')
      .asEnum(['production', 'development', 'test']),
    client: {
      url: env.get('CLIENT_URL').required().asUrlObject(),
    },
    host: {
      ip: env.get('HOST_IP').required().asString(),
    },
  };
}
