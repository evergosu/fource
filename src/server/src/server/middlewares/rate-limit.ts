import type { RequestHandler } from 'express';

import { getEnvironment } from 'server/library/environment';
import { rateLimit } from 'express-rate-limit';

const environment = getEnvironment();

const isProduction = environment.node === 'production';

export const rateLimitByEnvironment: RequestHandler[] = [
  isProduction
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        standardHeaders: true,
        legacyHeaders: false,
        max: 200,
      })
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        standardHeaders: true,
        legacyHeaders: false,
        max: 1000,
      }),
];
