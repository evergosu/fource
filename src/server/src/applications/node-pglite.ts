import { createPostgresLiteContext } from '../database/clients/pglite';
import { getEnvironment } from '../lib/environment';
import { startServer } from '../server/express';
import { Logger } from '../lib/logger';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'success' : 'error',
});

const pglite = await createPostgresLiteContext(logger);

export default startServer(pglite, logger);
