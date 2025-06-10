import type { Logger } from 'library/tools/logger';
import type { RequestHandler } from 'express';

import { createProxyMiddleware } from 'http-proxy-middleware';

export function createApiProxy(
  target: URL,
  logger: Logger,
): [string, RequestHandler] {
  logger.info(`Proxy /api → ${target.origin}/api`);

  return [
    '/api/',
    createProxyMiddleware({
      on: {
        proxyReq: (proxyRequest, request) => {
          logger.info(
            `[PROXY] ${request.method} ${request.originalUrl} → ${proxyRequest.protocol}//${proxyRequest.host}${proxyRequest.path}`,
          );
        },
        error: error => {
          logger.error('Error during proxy request.', error);
        },
      },
      target: `${target.origin}/api/`,
      changeOrigin: true,
      autoRewrite: true,
    }),
  ];
}
