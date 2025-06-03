import { createPostgresContext } from '../database/clients/postgresql';
import { getEnvironment } from '../lib/environment';
import { startServer } from '../server/express';
import { Logger } from '../lib/logger';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'success' : 'error',
});

const postgres = await createPostgresContext(logger);

export default startServer(postgres, logger);
