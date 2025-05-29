import { getEnvironment } from './lib/environment';
import { startServer } from './server/express';
import { Logger } from './lib/logger';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'production' ? 'default' : 'colorful',
  level: environment.node === 'production' ? 'error' : 'success',
});

export default await startServer(logger, environment.server.url).catch(
  (error: unknown) => {
    logger.error('Error during NextJS start.', error);
  },
);
