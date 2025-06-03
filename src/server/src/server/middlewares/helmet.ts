import type { RequestHandler } from 'express';

import { getEnvironment } from 'server/lib/environment';
import helmet from 'helmet';

const environment = getEnvironment();

const isProduction = environment.node === 'production';

export const helmetByEnvironment: RequestHandler[] = [
  helmet.hidePoweredBy(),
  helmet.frameguard({ action: 'deny' }),
  helmet.xssFilter(),
  helmet.noSniff(),
  helmet.permittedCrossDomainPolicies(),
  helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),

  isProduction
    ? helmet.hsts({
        maxAge: 60 * 60 * 24 * 365 * 2,
        includeSubDomains: true,
        preload: true,
      })
    : (_request, _response, next) => {
        next();
      },

  isProduction
    ? helmet.contentSecurityPolicy({
        directives: {
          styleSrc: ["'self'", "'unsafe-inline'"],
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
        useDefaults: true,
      })
    : helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'localhost:*',
          ],
          // eslint-disable-next-line sonarjs/no-clear-text-protocols
          connectSrc: ["'self'", 'ws:', 'http://localhost:*'],
        },
        useDefaults: true,
      }),
];
