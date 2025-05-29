import type { RequestHandler } from 'express';

import { getEnvironment } from 'client/lib/environment';
import { rateLimit } from 'express-rate-limit';

const environment = getEnvironment();

const isProduction = environment.node === 'production';

export const rateLimitByEnvironment: RequestHandler[] = [
  isProduction
    ? rateLimit({
        standardHeaders: true,
        legacyHeaders: false,
        windowMs: 60 * 1000,
        max: 100,
      })
    : rateLimit({
        standardHeaders: true,
        legacyHeaders: false,
        windowMs: 60 * 1000,
        max: 1000,
      }),
];
