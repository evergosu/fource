import type { RequestHandler } from 'express';

import { getEnvironment } from 'client/library/environment';
import morgan from 'morgan';

const environment = getEnvironment();

const isProduction = environment.node === 'production';

export const morganByEnvironment: RequestHandler[] = [
  isProduction
    ? morgan('combined', {
        skip: (_, response) => response.statusCode < 400,
      })
    : morgan('dev'),
];
