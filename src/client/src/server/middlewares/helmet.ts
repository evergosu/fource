import type { RequestHandler } from 'express';

import { getEnvironment } from 'client/library/environment';
import helmet from 'helmet';

const environment = getEnvironment();

const isProduction = environment.node === 'production';

export const helmetByEnvironment: RequestHandler[] = [
  helmet.hidePoweredBy(),
  helmet.frameguard({ action: 'deny' }),
  helmet.noSniff(),
  helmet.permittedCrossDomainPolicies(),
  helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),

  isProduction
    ? helmet.contentSecurityPolicy({
        directives: {
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          upgradeInsecureRequests: [],
          connectSrc: ["'self'"],
          defaultSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
        useDefaults: true,
      })
    : helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*'],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*'],
          styleSrc: ["'self'", "'unsafe-inline'", 'localhost:*'],
          // eslint-disable-next-line sonarjs/no-clear-text-protocols
          connectSrc: ["'self'", 'ws:', 'http://localhost:*'],
        },
        useDefaults: true,
      }),
];
