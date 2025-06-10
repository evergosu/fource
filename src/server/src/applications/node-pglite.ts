import { Logger } from 'library/tools/logger';

import { createPostgresLiteContext } from '../database/clients/pglite';
import { getEnvironment } from '../lib/environment';
import { startServer } from '../server/express';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const pglite = await createPostgresLiteContext(logger);

export default startServer(pglite, logger);
