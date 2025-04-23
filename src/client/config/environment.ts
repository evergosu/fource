import { log } from 'node:console';
import { URL } from 'node:url';
import dotenv from 'dotenv';
import env from 'env-var';

// The path is one level higher since it will be used by next.js at the root level of the package.
const path = new URL(`../../.env.${process.env.NODE_ENV}`, import.meta.url)
  .pathname;

dotenv.config({
  path: [path],
});

log('Reading:', path);

export function getEnvironment() {
  return {
    client: {
      url: env.get('CLIENT_URL').required().asUrlObject(),
    },
    server: {
      url: env.get('SERVER_URL').required().asUrlObject(),
    },
  };
}
