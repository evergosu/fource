// config/environment.ts
import { log } from "node:console";
import { URL } from "node:url";
import dotenv from "dotenv";
import env from "env-var";
var path = new URL(`../../.env.${process.env.NODE_ENV}`, import.meta.url).pathname;
dotenv.config({
  path: [path]
});
log("Reading:", path);
function getEnvironment() {
  return {
    client: {
      url: env.get("CLIENT_URL").required().asUrlObject()
    },
    server: {
      url: env.get("SERVER_URL").required().asUrlObject()
    }
  };
}

// config/next.config.ts
var environment = getEnvironment();
var next_config_default = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async rewrites() {
    return [
      {
        destination: `${environment.server.url.origin}/api/:path*`,
        source: "/api/:path*"
      }
    ];
  },
  eslint: {
    // Enabled in root scripts.
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_ORIGIN: environment.client.url.origin
  },
  experimental: {
    typedRoutes: true
  },
  poweredByHeader: false
};
export {
  next_config_default as default
};
