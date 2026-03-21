import { createPostgresLiteContext } from 'server/infrastructure/database/clients/pglite';
import { getEnvironment } from 'server/library/environment';
import { Logger } from 'library/tools/logger';

import { startServer } from '../express';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const pglite = await createPostgresLiteContext(logger);

export default startServer(pglite, logger);
