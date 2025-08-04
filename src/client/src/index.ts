import { Logger } from 'library/tools/logger';

import { getEnvironment } from './library/environment';
import { startServer } from './server/express';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

export default await startServer(logger, environment.server.url).catch(
  (error: unknown) => {
    logger.error('Error during NextJS start.', error);
  },
);
